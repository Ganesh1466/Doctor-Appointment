const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.email?.includes('admin'))) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

export { admin };
