const { sendSOSEmail } = require('../utils/emailService');
const User = require('../models/User');
const SOS = require('../models/SOS');
const { detectDeviceType, getClientIP } = require('../utils/deviceDetection');
const { ForbiddenError, NotFoundError, BadRequestError } = require('../utils/customErrors');

const sendSOS = async (req, res, next) => {
    if(!req.body.lat || !req.body.lng || !req.body.email) {
        return res.status(400).json({
            success: false,
            message: "Latitude and longitude are required"
        });
    }
    try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${req.body.lat},${req.body.lng}&key=AIzaSyBV-b1cB98UbBVMorIwJOY4FN1oiE7gOec`);
        const data = await response.json();
        console.log(data.results[0]);
        
        // Get user details
        const user = await User.findById(req.user.userId);
        if (!user) {
            throw new NotFoundError("User not found");
        }

        // Create SOS record in SOS model
        const sosRecord = new SOS({
            userId: user._id,
            userName: `${user.firstname} ${user.lastname}`,
            userEmail: user.email,
            location: {
                latitude: req.body.lat,
                longitude: req.body.lng,
                address: data.results[0].formatted_address
            },
            recipientEmail: req.body.email,
            status: 'sent',
            notes: req.body.notes || '',
            emergencyContact: req.body.emergencyContact || null,
            deviceInfo: {
                userAgent: req.headers['user-agent'] || 'Unknown',
                ipAddress: getClientIP(req),
                deviceType: detectDeviceType(req.headers['user-agent'])
            }
        });

        await sosRecord.save();
        
        // Also save to user model for backward compatibility
        user.sosActivities.push({
            location: {
                latitude: req.body.lat,
                longitude: req.body.lng,
                address: data.results[0].formatted_address
            },
            recipientEmail: req.body.email,
            status: 'sent'
        });
        await user.save();
        
        // Send email
        await sendSOSEmail(req.body.email, data.results[0].formatted_address, req.user.name, req.user.email);

        res.json({
            success: true,
            message: "SOS sent successfully",
            data: {
                sosId: sosRecord._id,
                address: data.results[0].formatted_address,
                status: sosRecord.status,
                createdAt: sosRecord.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get all SOS requests (admin only)
const getAllSOSRequests = async (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            throw new ForbiddenError("Not authorized to access this resource");
        }

        const { page = 1, limit = 10, status, userId } = req.query;
        const skip = (page - 1) * limit;

        // Build query
        const query = {};
        if (status) query.status = status;
        if (userId) query.userId = userId;

        const sosRequests = await SOS.find(query)
            .populate('userId', 'firstname lastname email')
            .populate('resolvedBy', 'firstname lastname email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await SOS.countDocuments(query);
        const statistics = await SOS.getStatistics();

        res.json({
            success: true,
            sosRequests,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            },
            statistics
        });
    } catch (error) {
        next(error);
    }
};

// Get user's SOS requests
const getUserSOSRequests = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;

        // Build query
        const query = { userId: req.user.userId };
        if (status) query.status = status;

        const sosRequests = await SOS.find(query)
            .populate('resolvedBy', 'firstname lastname email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await SOS.countDocuments(query);

        res.json({
            success: true,
            sosRequests,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get single SOS request
const getSOSRequest = async (req, res, next) => {
    try {
        const { sosId } = req.params;

        const sosRequest = await SOS.findById(sosId)
            .populate('userId', 'firstname lastname email')
            .populate('resolvedBy', 'firstname lastname email');

        if (!sosRequest) {
            throw new NotFoundError("SOS request not found");
        }

        // Check if user can access this SOS request
        if (req.user.role !== "admin" && sosRequest.userId.toString() !== req.user.userId) {
            throw new ForbiddenError("Not authorized to access this SOS request");
        }

        res.json({
            success: true,
            sosRequest
        });
    } catch (error) {
        next(error);
    }
};

// Update SOS request status (admin only)
const updateSOSStatus = async (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            throw new ForbiddenError("Not authorized to access this resource");
        }

        const { sosId } = req.params;
        const { status, notes } = req.body;

        const sosRequest = await SOS.findById(sosId);
        if (!sosRequest) {
            throw new NotFoundError("SOS request not found");
        }

        // Update status based on action
        switch (status) {
            case 'received':
                await sosRequest.markAsReceived();
                break;
            case 'resolved':
                await sosRequest.markAsResolved(req.user.userId, notes);
                break;
            case 'cancelled':
                await sosRequest.cancelSOS(notes);
                break;
            default:
                throw new BadRequestError("Invalid status");
        }

        // Also update user's SOS activities for backward compatibility
        const user = await User.findById(sosRequest.userId);
        if (user) {
            const userSOSActivity = user.sosActivities.find(
                activity => activity.timestamp.getTime() === sosRequest.createdAt.getTime()
            );
            if (userSOSActivity) {
                userSOSActivity.status = status;
                await user.save();
            }
        }

        res.json({
            success: true,
            message: `SOS request ${status} successfully`,
            sosRequest
        });
    } catch (error) {
        next(error);
    }
};

// Get SOS statistics (admin only)
const getSOSStatistics = async (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            throw new ForbiddenError("Not authorized to access this resource");
        }

        const statistics = await SOS.getStatistics();

        // Get recent SOS requests for dashboard
        const recentSOS = await SOS.find()
            .populate('userId', 'firstname lastname email')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            statistics,
            recentSOS
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    sendSOS,
    getAllSOSRequests,
    getUserSOSRequests,
    getSOSRequest,
    updateSOSStatus,
    getSOSStatistics
};