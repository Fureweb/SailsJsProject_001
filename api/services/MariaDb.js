var _ = require( "lodash" );
var mysql = require( "mysql" );

var connInfo = sails.config.MariaDBInfo;
if( !connInfo ) connInfo = sails.config.connections.MariaDBInfo;
if( !connInfo ) return;

var defaultDatabase = connInfo.database || "mysql";

var poolObject = null;

var makeConnPool = function()
{
    if( !poolObject )
        poolObject = mysql.createPool( connInfo );

    return poolObject;
};

var makeConnection = function()
{
    var promise = new Promise(function( resolve, reject )
    {
        var pool = makeConnPool();
        pool.getConnection(function( err, connection )
        {
            if( err ) reject( err );
            else resolve( connection );
        });
    });

    return promise;
};

var type = { ':' : '?' , ';' : '??' };
var re = /([:;\$])([a-zA-Z0-9_]+)/g;
var parseSql = ( str, params ) =>
{
    if( !str ) return [ "", [] ];
    var va = [];
    var rs = str.replace( re, ( m, $1 , $2 ) =>
    {
        if( $1 === "$" )
        {
            if( params )
                return params[$2].replace(/'/g,"''");
            else
                return '';
        }
        va.push( $2 );
        return type[$1];
    });
    return [rs , va];
};

var convertSql = function( sql, params )
{
    var p = parseSql( sql, params );

    var newSql = p[0];
    var va = p[1];
    var newParams = [];

    va.forEach(function( v, i )
    {
        newParams.push( params ? params[v] : undefined );
    });

    return { sql : newSql, params : newParams };
};

var ConnectionProxy = function( connection )
{
    this._connection = connection;

    this._queue = [];
    this._isQueryPending = false;
    this._finishRequest = null;
};

ConnectionProxy.prototype = {
    constructor : ConnectionProxy,
    _run : function()
    {
        var self = this;

        if( self._finishRequest ) return;
        if( self._isQueryPending ) return;
        if( self._queue.length <= 0 ) return;

        var item = self._queue.shift();

        var sql = item.sql;
        var params = item.params;
        var rowHandler = item.rowHandler;
        var resolve = item.resolve;
        var reject = item.reject;

        self._isQueryPending = true;

        var cs;
        try
        {
            cs = convertSql( sql, params );
        }
        catch( err )
        {
            self._isQueryPending = false;

            reject( [ sql, params, err ] );

            if( self._finishRequest && self._finishRequest.resolve )
                self._finishRequest.resolve( self._queue );
            else
                self._run();
            return;
        }

        if( rowHandler )
        {
            var query = self._connection.query( cs.sql, cs.params );
            var lastResult = undefined;

            query.on( "error", function( err )
            {
                self._isQueryPending = false;

                reject( [ sql, params, err ] );

                if( self._finishRequest && self._finishRequest.resolve )
                    self._finishRequest.resolve( self._queue );
                else
                    self._run();
            }).
                 on( "end", function()
            {
                self._isQueryPending = false;

                resolve( lastResult );

                if( self._finishRequest && self._finishRequest.resolve )
                    self._finishRequest.resolve( self._queue );
                else
                    self._run();
            }).
                 on( "result", function( row )
            {
                lastResult = row;

                if( rowHandler )
                    try { rowHandler( row ); } catch( e ) {}
            });
        }
        else
        {
            self._connection.query( cs.sql, cs.params, function( err, result )
            {
                self._isQueryPending = false;

                if( err )
                    reject( [ sql, params, err ] );
                else
                    resolve( result );

                if( self._finishRequest && self._finishRequest.resolve )
                    self._finishRequest.resolve( self._queue );
                else
                    self._run();
            });
        }
    },
    _finish : function()
    {
        var self = this;

        if( self._finishRequest )
            return self._finishRequest.promise;

        if( !(self._isQueryPending) )
        {
            self._finishRequest = {};
            self._finishRequest.promise = Promise.resolve( self._queue );
            return self._finishRequest.promise;
        }

        self._finishRequest = {};
        var promise = new Promise(function( resolve, reject )
        {
            self._finishRequest.resolve = resolve;
            self._finishRequest.reject = reject;

            if( !(self._isQueryPending) )
                resolve( self._queue );
        });
        self._finishRequest.promise = promise;
        return promise;
    },
    query : function( sql, params )
    {
        var self = this;

        if( self._finishRequest )
            throw new Error( "Finished Connection!" );

        var promise = new Promise(function( resolve, reject )
        {
            self._queue.push( { sql : sql, params : params, resolve : resolve, reject : reject } );
            self._run();
        });

        return promise;
    },
    queryWithRowHandler : function( sql, params, rowHandler )
    {
        var self = this;

        if( self._finishRequest )
            throw new Error( "Finished Connection!" );

        var promise = new Promise(function( resolve, reject )
        {
            self._queue.push( { sql : sql, params : params, rowHandler : rowHandler, resolve : resolve, reject : reject } );
            self._run();
        });

        return promise;
    }
};

var connectionStack = [];

module.exports = function( databaseToUse, provider )
{
    if( _.isFunction( databaseToUse ) )
    {
        provider = databaseToUse;
        databaseToUse = null;
    }

    var connPromise;
    var isConnInherited = false;

    var parentDatabase = null;
    var connection = null;

    if( connectionStack.length > 0 )
    {
        connPromise = new Promise( ( resolve, reject ) => resolve( connectionStack[connectionStack.length-1] ) );
        isConnInherited = true;
    }
    else
    {
        connPromise = makeConnection();
        isConnInherited = false;
    }

    if( databaseToUse )
    {
        connPromise = connPromise.then(function( conn )
        {
            connection = conn;

            return new Promise(function( resolve, reject )
            {
                connection.query( "SELECT DATABASE() AS 'database' FROM DUAL", {}, function( err, result )
                {
                    if( err )
                    {
                        reject( err );
                        return;
                    }

                    parentDatabase = result[0].database;

                    connection.query( "USE " + databaseToUse, {}, function( err, result )
                    {
                        if( err )
                        {
                            reject( err );
                            return;
                        }

                        resolve( connection );
                    });
                })
            })
        });
    }

    var promise = new Promise(function( resolve, reject )
    {
        connPromise.then(
            function( connection )
            {
                var body = function( connection )
                {
                    var connProxy = new ConnectionProxy( connection );
                    var it = provider( connProxy );

                    var lastResult = undefined;
                    var loop = function( err )
                    {
                        var itRet;
                        connectionStack.push( connection );
                        try
                        {
                            if( err )
                                itRet = it.throw( err );
                            else
                                itRet = it.next( lastResult );
                        }
                        catch( err )
                        {
                            if( isConnInherited )
                            {
                                reject( err );
                            }
                            else
                            {
                                connProxy._finish().then(
                                    function()
                                    {
                                        connection.rollback(function( e )
                                        {
                                            connection.release();
                                            reject( err );
                                        });
                                    });
                            }
                            return;
                        }
                        finally
                        {
                            connectionStack.pop();
                        }

                        var itDone = itRet.done;
                        var itValue = itRet.value;

                        if( _.isArray( itValue ) )
                            itValue = Promise.all( _.map( itValue, v => v.then ? v : Promise.resolve( v ) ) );

                        if( itValue && itValue.then )
                        {
                            itValue.then(
                                function( result )
                                {
                                    lastResult = result;
                                    if( itDone )
                                    {
                                        if( isConnInherited )
                                        {
                                            resolve( lastResult );
                                        }
                                        else
                                        {
                                            connProxy._finish().then(
                                                function()
                                                {
                                                    connection.commit(function( err )
                                                    {
                                                        connection.release();

                                                        if( err ) reject( err );
                                                        else resolve( lastResult );
                                                    });
                                                });
                                        }
                                    }
                                    else
                                    {
                                        loop();
                                    }
                                },
                                function( err )
                                {
                                    lastResult = undefined;
                                    if( itDone )
                                    {
                                        if( isConnInherited )
                                        {
                                            reject( err );
                                        }
                                        else
                                        {
                                            connProxy._finish().then(
                                                function()
                                                {
                                                    connection.rollback(function( e )
                                                    {
                                                        connection.release();
                                                        reject( err );
                                                    });
                                                });
                                        }
                                    }
                                    else
                                    {
                                        loop( err );
                                    }
                                });
                        }
                        else
                        {
                            lastResult = itValue;
                            if( itDone )
                            {
                                if( isConnInherited )
                                {
                                    resolve( lastResult );
                                }
                                else
                                {
                                    connProxy._finish().then(
                                        function()
                                        {
                                            connection.commit(function( err )
                                            {
                                                connection.release();

                                                if( err ) reject( err );
                                                else resolve( lastResult );
                                            });
                                        });
                                }
                            }
                            else
                            {
                                loop();
                            }
                        }
                    };
                    loop();
                };

                if( isConnInherited )
                {
                    body( connection );
                }
                else
                {
                    connection.beginTransaction(function( err )
                    {
                        if( err )
                        {
                            connection.release();
                            reject( err );
                            return;
                        }

                        body( connection );
                    });
                }
            },
            function( err )
            {
                reject( err );
            });
    });

    if( databaseToUse )
    {
        parentDatabase = parentDatabase || defaultDatabase;

        var prevPromise = promise;
        promise = new Promise(function( resolve, reject )
        {
            prevPromise.then(
                function( result )
                {
                    connection.query( "USE " + parentDatabase, {}, function( err, r )
                    {
                        if( err )
                        {
                            reject( err );
                            return;
                        }

                        resolve( result );
                    });
                },
                function( err )
                {
                    reject( err );
                });
        });
    }

    return promise;
};
