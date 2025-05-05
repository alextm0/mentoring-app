function checkOwnership(req, res, next) {
  const { mentorId } = req.params;
  
  if (mentorId !== req.user.id) {
    return res.status(403).json({ message: 'You can only access your own resources' });
  }

  next();
}

module.exports = checkOwnership; 