// Role-checking middleware
function checkUserRole(requiredRole) {
    return (req, res, next) => {
        const { userRole } = req.session;
        
        if (!userRole) {
            return res.status(401).json({ message: 'Unauthorized: No role found' });
        }

        if (userRole !== requiredRole) {
            return res.status(403).json({ message: `Forbidden: Requires ${requiredRole} role` });
        }
        
        // User has the required role
        next();
    };
}

module.exports = checkUserRole;