// Middleware to check user roles

// Check if user is Super Admin
const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ 
      success: false,
      message: "Access denied. Super Admin privileges required." 
    });
  }
  next();
};

// Check if user is Admin or Super Admin
const isAdmin = (req, res, next) => {
  if (!["admin", "superadmin"].includes(req.user.role)) {
    return res.status(403).json({ 
      success: false,
      message: "Access denied. Admin privileges required." 
    });
  }
  next();
};

// Check if user is Support or higher (Support, Admin, Super Admin)
const isSupport = (req, res, next) => {
  if (!["support", "admin", "superadmin"].includes(req.user.role)) {
    return res.status(403).json({ 
      success: false,
      message: "Access denied. Support privileges required." 
    });
  }
  next();
};

// Check if user is Provider
const isProvider = (req, res, next) => {
  if (req.user.role !== "provider") {
    return res.status(403).json({ 
      success: false,
      message: "Access denied. Provider privileges required." 
    });
  }
  next();
};

// Check if user is Seeker
const isSeeker = (req, res, next) => {
  if (req.user.role !== "seeker") {
    return res.status(403).json({ 
      success: false,
      message: "Access denied. Seeker privileges required." 
    });
  }
  next();
};

// Check if user has any of the specified roles
const hasRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required roles: ${roles.join(", ")}` 
      });
    }
    next();
  };
};

module.exports = {
  isSuperAdmin,
  isAdmin,
  isSupport,
  isProvider,
  isSeeker,
  hasRole
};


