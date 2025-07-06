const Setting = require('../models/Settings');

const changePassword = async (req, res, next) => {};

const changeSOSEmail = async (req, res, next) => {
    try {
        const { sosMail } = req.body;
        let setting = await Setting.findOne({ userId: req.user.userId });
        
        if (!setting) {
            setting = new Setting({
                userId: req.user.userId,
                sosMail: sosMail
            });
        } else {
            setting.sosMail = sosMail;
        }
        
        await setting.save();
        res.json({ success: true, message: 'SOS Email updated successfully', data: setting });
    } catch (error) {
        next(error);
    }
};

const getSettings = async (req, res, next) => {
    try {
        const setting = await Setting.findOne({ userId: req.user.userId });
        if (!setting) {
            return res.json({ success: true, message: 'No settings found', data: {} });
        }
        return res.json({ success: true, data: setting });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    changePassword,
    changeSOSEmail,
    getSettings
};