const Hearing = require('../models/Hearing');
const Case = require('../models/Case');
const Notification = require('../models/Notification');

// @desc    Schedule new hearing
// @route   POST /api/hearings
// @access  Private (Admin, Court Staff, Judge)
exports.scheduleHearing = async (req, res) => {
  try {
    const hearing = await Hearing.create(req.body);
    
    // Update case with next hearing date
    await Case.findByIdAndUpdate(req.body.case, {
      nextHearingDate: req.body.hearingDate,
      $push: {
        timeline: {
          event: 'Hearing Scheduled',
          description: `Hearing scheduled for ${new Date(req.body.hearingDate).toLocaleDateString()}`,
          performedBy: req.user.id,
          date: new Date()
        }
      }
    });
    
    // Get case details for notifications
    const caseData = await Case.findById(req.body.case)
      .populate('plaintiff.lawyer defendant.lawyer assignedJudge');
    
    // Create notifications for all involved parties
    const parties = [
      caseData.assignedJudge?._id,
      caseData.plaintiff.lawyer?._id,
      caseData.defendant.lawyer?._id
    ].filter(Boolean);
    
    for (const partyId of parties) {
      await Notification.create({
        user: partyId,
        type: 'Hearing',
        title: 'Hearing Scheduled',
        message: `Hearing for case ${caseData.caseNumber} scheduled on ${new Date(req.body.hearingDate).toLocaleDateString()}`,
        relatedCase: req.body.case,
        relatedHearing: hearing._id,
        priority: 'High'
      });
    }
    
    res.status(201).json({
      success: true,
      data: hearing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all hearings
// @route   GET /api/hearings
// @access  Private
exports.getAllHearings = async (req, res) => {
  try {
    const { status, date, caseId } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.hearingDate = { $gte: startOfDay, $lte: endOfDay };
    }
    
    if (caseId) {
      query.case = caseId;
    }
    
    // Role-based filtering
    if (req.user.role === 'Judge') {
      query.judge = req.user.id;
    } else if (req.user.role === 'Lawyer') {
      const userCases = await Case.find({
        $or: [
          { 'plaintiff.lawyer': req.user.id },
          { 'defendant.lawyer': req.user.id }
        ]
      }).select('_id');
      query.case = { $in: userCases.map(c => c._id) };
    }
    
    const hearings = await Hearing.find(query)
      .populate('case', 'caseNumber caseTitle caseType')
      .populate('judge', 'firstName lastName')
      .populate('attendees.user', 'firstName lastName role')
      .sort({ hearingDate: 1 });
    
    res.status(200).json({
      success: true,
      count: hearings.length,
      data: hearings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single hearing
// @route   GET /api/hearings/:id
// @access  Private
exports.getHearing = async (req, res) => {
  try {
    const hearing = await Hearing.findById(req.params.id)
      .populate('case')
      .populate('judge', 'firstName lastName email')
      .populate('attendees.user', 'firstName lastName role email');
    
    if (!hearing) {
      return res.status(404).json({
        success: false,
        message: 'Hearing not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: hearing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update hearing
// @route   PUT /api/hearings/:id
// @access  Private (Judge, Court Staff)
exports.updateHearing = async (req, res) => {
  try {
    let hearing = await Hearing.findById(req.params.id);
    
    if (!hearing) {
      return res.status(404).json({
        success: false,
        message: 'Hearing not found'
      });
    }
    
    hearing = await Hearing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    // If hearing is completed or adjourned, update case timeline
    if (req.body.status === 'Completed' || req.body.status === 'Adjourned') {
      await Case.findByIdAndUpdate(hearing.case, {
        $push: {
          timeline: {
            event: `Hearing ${req.body.status}`,
            description: req.body.status === 'Adjourned' 
              ? `Hearing adjourned. Reason: ${req.body.adjournmentReason}` 
              : 'Hearing completed successfully',
            date: new Date()
          }
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: hearing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get hearings calendar
// @route   GET /api/hearings/calendar/monthly
// @access  Private
exports.getHearingsCalendar = async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    let query = {
      hearingDate: { $gte: startDate, $lte: endDate }
    };
    
    if (req.user.role === 'Judge') {
      query.judge = req.user.id;
    }
    
    const hearings = await Hearing.find(query)
      .populate('case', 'caseNumber caseTitle')
      .populate('judge', 'firstName lastName')
      .sort({ hearingDate: 1 });
    
    res.status(200).json({
      success: true,
      data: hearings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get upcoming hearings
// @route   GET /api/hearings/upcoming/list
// @access  Private
exports.getUpcomingHearings = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let query = {
      hearingDate: { $gte: today },
      status: { $in: ['Scheduled', 'In Progress'] }
    };
    
    if (req.user.role === 'Judge') {
      query.judge = req.user.id;
    } else if (req.user.role === 'Lawyer') {
      const userCases = await Case.find({
        $or: [
          { 'plaintiff.lawyer': req.user.id },
          { 'defendant.lawyer': req.user.id }
        ]
      }).select('_id');
      query.case = { $in: userCases.map(c => c._id) };
    }
    
    const hearings = await Hearing.find(query)
      .populate('case', 'caseNumber caseTitle priority')
      .populate('judge', 'firstName lastName')
      .sort({ hearingDate: 1 })
      .limit(10);
    
    res.status(200).json({
      success: true,
      data: hearings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
