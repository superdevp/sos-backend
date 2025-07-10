/**
 * Detect device type from user agent string
 * @param {string} userAgent - The user agent string
 * @returns {string} - Device type (mobile, tablet, desktop, unknown)
 */
const detectDeviceType = (userAgent) => {
  if (!userAgent) return 'unknown';
  
  const ua = userAgent.toLowerCase();
  
  // Mobile detection
  if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(ua)) {
    if (/tablet|ipad/i.test(ua)) {
      return 'tablet';
    }
    return 'mobile';
  }
  
  // Desktop detection
  if (/windows|macintosh|linux/i.test(ua)) {
    return 'desktop';
  }
  
  return 'unknown';
};

/**
 * Extract IP address from request object
 * @param {Object} req - Express request object
 * @returns {string} - IP address
 */
const getClientIP = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         req.connection.socket?.remoteAddress ||
         'unknown';
};

module.exports = {
  detectDeviceType,
  getClientIP
}; 