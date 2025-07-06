const { sendSOSEmail } = require('../utils/emailService');

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
        // return res.json({data: data.results});
        await sendSOSEmail(req.body.email, data.results[0].formatted_address, req.user.name, req.user.email);

        res.json({
            success: true,
            message: "SOS sent successfully",
            data: data.results[0].formatted_address
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    sendSOS
}