const Case = require('../models/Case');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create new case
// @route   POST /api/cases
// @access  Private (Admin, Court Staff)
exports.createCase = async (req, res) => {
  try {
    const caseData = req.body;
    
    // Add initial timeline entry
    caseData.timeline = [{
      event: 'Case Filed',
      description: 'Case has been filed in the court',
      performedBy: req.user.id,
      date: new Date()
    }];
    
    const newCase = await Case.create(caseData);
    
    // Update assigned judge's cases
    if (newCase.assignedJudge) {
      await User.findByIdAndUpdate(
        newCase.assignedJudge,
        { $push: { assignedCases: newCase._id } }
      );
      
      // Create notification for judge
      await Notification.create({
        user: newCase.assignedJudge,
        type: 'Assignment',
        title: 'New Case Assigned',
        message: `Case ${newCase.caseNumber} has been assigned to you`,
        relatedCase: newCase._id,
        priority: 'High'
      });
    }
    
    // Notify lawyers
    const lawyerIds = [newCase.plaintiff.lawyer, newCase.defendant.lawyer].filter(Boolean);
    for (const lawyerId of lawyerIds) {
      await User.findByIdAndUpdate(
        lawyerId,
        { $push: { assignedCases: newCase._id } }
      );
      
      await Notification.create({
        user: lawyerId,
        type: 'Assignment',
        title: 'New Case Assignment',
        message: `You have been assigned to case ${newCase.caseNumber}`,
        relatedCase: newCase._id,
        priority: 'High'
      });
    }
    
    res.status(201).json({
      success: true,
      data: newCase
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all cases
// @route   GET /api/cases
// @access  Private
exports.getAllCases = async (req, res) => {
  try {
    const { status, caseType, priority, search } = req.query;
    let query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by case type
    if (caseType) {
      query.caseType = caseType;
    }
    
    // Filter by priority
    if (priority) {
      query.priority = priority;
    }
    
    // Search by case number or title
    if (search) {
      query.$or = [
        { caseNumber: { $regex: search, $options: 'i' } },
        { caseTitle: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Role-based filtering
    if (req.user.role === 'Judge') {
      query.assignedJudge = req.user.id;
    } else if (req.user.role === 'Lawyer') {
      query.$or = [
        { 'plaintiff.lawyer': req.user.id },
        { 'defendant.lawyer': req.user.id }
      ];
    }
    
    const cases = await Case.find(query)
      .populate('assignedJudge', 'firstName lastName email')
      .populate('plaintiff.lawyer', 'firstName lastName barCouncilId')
      .populate('defendant.lawyer', 'firstName lastName barCouncilId')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: cases.length,
      data: cases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single case
// @route   GET /api/cases/:id
// @access  Private
exports.getCase = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id)
      .populate('assignedJudge', 'firstName lastName email contactNumber')
      .populate('plaintiff.lawyer', 'firstName lastName barCouncilId email contactNumber')
      .populate('defendant.lawyer', 'firstName lastName barCouncilId email contactNumber')
      .populate('timeline.performedBy', 'firstName lastName role')
      .populate('documents.uploadedBy', 'firstName lastName role');
    
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: caseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update case
// @route   PUT /api/cases/:id
// @access  Private (Admin, Court Staff, Judge)
exports.updateCase = async (req, res) => {
  try {
    let caseData = await Case.findById(req.params.id);
    
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }
    
    // Add timeline entry for updates
    if (req.body.status && req.body.status !== caseData.status) {
      caseData.timeline.push({
        event: 'Status Updated',
        description: `Status changed from ${caseData.status} to ${req.body.status}`,
        performedBy: req.user.id,
        date: new Date()
      });
    }
    
    caseData = await Case.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: caseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload document to case
// @route   POST /api/cases/:id/documents
// @access  Private
exports.uploadDocument = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }
    
    const document = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      uploadedBy: req.user.id,
      documentType: req.body.documentType || 'Other',
      uploadDate: new Date()
    };
    
    caseData.documents.push(document);
    
    // Add to timeline
    caseData.timeline.push({
      event: 'Document Uploaded',
      description: `Document "${req.file.originalname}" uploaded`,
      performedBy: req.user.id,
      date: new Date()
    });
    
    await caseData.save();
    
    res.status(200).json({
      success: true,
      data: caseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get case statistics
// @route   GET /api/cases/stats/dashboard
// @access  Private
exports.getCaseStats = async (req, res) => {
  try {
    const totalCases = await Case.countDocuments();
    const activeCases = await Case.countDocuments({ 
      status: { $in: ['Filed', 'Under Review', 'Hearing Scheduled', 'In Progress'] } 
    });
    const closedCases = await Case.countDocuments({ status: 'Closed' });
    
    const casesByType = await Case.aggregate([
      { $group: { _id: '$caseType', count: { $sum: 1 } } }
    ]);
    
    const casesByStatus = await Case.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalCases,
        activeCases,
        closedCases,
        casesByType,
        casesByStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
