const mcache = require('memory-cache');

/**
 * Cache response in Seconds
 * @param {int} duration 
 */
const cache = (duration) => {
    return (req, res, next) => {
        let key = '__express__' + req.originalUrl || req.url
        let cachedBody = mcache.get(key)
        if (cachedBody) {
            res.type('json').send(cachedBody)
            return
        } else {
            res.sendResponse = res.send
            res.send = (body, code) => {
                if(res.statusCode == 200) {
                    mcache.put(key, body, duration * 1000);
                }
                res.sendResponse(body)
            }
            next()
        }
    }
}

module.exports = cache;