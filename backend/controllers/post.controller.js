const activeCheck = async (req, res, next) => {
    try {
        return res.status(200).json({ 
            message: "Active",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
};

export default activeCheck;