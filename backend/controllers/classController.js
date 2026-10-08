const ClassSession = require('../models/Class');
const Student = require('../models/Student');
const {
  isWeekendOrHolidaySession,
  formatDisplayDate,
} = require('../utils/weekendValidation');
const { validateBase64Attachment } = require('../utils/attachmentValidation');

const ALLOWED_DAYS = ['Saturday', 'Sunday', 'Holiday'];

const toPublicClass = (doc, studentId = null, includeFileData = false) => {
  const obj = doc.toObject({ virtuals: true });
  const registeredCount = obj.registeredStudents?.length || 0;
  const availableSeats = Math.max(0, obj.capacity - registeredCount);
  const isRegistered = studentId
    ? (obj.registeredStudents || []).some((id) => String(id) === String(studentId))
    : false;

  return {
    id: obj._id,
    title: obj.title,
    skill: obj.skill,
    description: obj.description,
    linkUrl: obj.linkUrl || '',
    fileName: obj.fileName || '',
    ...(includeFileData ? { fileData: obj.fileData || '' } : {}),
    date: obj.date,
    displayDate: formatDisplayDate(obj.date),
    day: obj.day,
    startTime: obj.startTime,
    endTime: obj.endTime,
    time: `${obj.startTime} - ${obj.endTime}`,
    location: obj.location,
    communityCentre: obj.location,
    facilitator: obj.facilitator,
    volunteerName: obj.facilitator,
    capacity: obj.capacity,
    registeredCount,
    availableSeats,
    isRegistered,
    status: isRegistered ? 'Registered' : availableSeats > 0 ? 'Open' : 'Full',
  };
};

const parseTimeRange = (time) => {
  if (!time || typeof time !== 'string') return null;
  const parts = time.split('-').map((p) => p.trim());
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return { startTime: parts[0], endTime: parts[1] };
};

/**
 * GET /api/classes
 * Student: weekend/holiday only + registration flags
 * Volunteer: all community classes with seat counts
 */
const getClasses = async (req, res) => {
  try {
    const all = await ClassSession.find().sort({ date: 1 });

    if (req.role === 'volunteer') {
      return res.json({
        success: true,
        classes: all.map((c) => toPublicClass(c)),
      });
    }

    const weekendOnly = all.filter((c) => isWeekendOrHolidaySession(c.day, c.date));
    return res.json({
      success: true,
      classes: weekendOnly.map((c) => toPublicClass(c, req.user._id)),
    });
  } catch (error) {
    console.error('Get classes error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to load classes. Please try again.',
    });
  }
};

const getMyRegistrations = async (req, res) => {
  try {
    const classes = await ClassSession.find({
      registeredStudents: req.user._id,
    }).sort({ date: 1 });

    const weekendOnly = classes.filter((c) => isWeekendOrHolidaySession(c.day, c.date));

    return res.json({
      success: true,
      classes: weekendOnly.map((c) => toPublicClass(c, req.user._id)),
    });
  } catch (error) {
    console.error('My registrations error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to load your registrations. Please try again.',
    });
  }
};

const getClassById = async (req, res) => {
  try {
    const classSession = await ClassSession.findById(req.params.classId);
    if (!classSession) {
      return res.status(404).json({
        success: false,
        message: 'Class not found.',
      });
    }

    if (
      req.role === 'student' &&
      !isWeekendOrHolidaySession(classSession.day, classSession.date)
    ) {
      return res.status(400).json({
        success: false,
        message: 'This session is not a valid weekend or holiday class.',
      });
    }

    return res.json({
      success: true,
      class: toPublicClass(classSession, req.role === 'student' ? req.user._id : null, true),
    });
  } catch (error) {
    console.error('Get class error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to load class details. Please try again.',
    });
  }
};

const registerForClass = async (req, res) => {
  try {
    const classSession = await ClassSession.findById(req.params.classId);
    if (!classSession) {
      return res.status(404).json({
        success: false,
        message: 'Class not found.',
      });
    }

    if (!isWeekendOrHolidaySession(classSession.day, classSession.date)) {
      return res.status(400).json({
        success: false,
        message: 'This session is not a valid weekend or holiday class.',
      });
    }

    const studentId = req.user._id;
    const already = classSession.registeredStudents.some(
      (id) => String(id) === String(studentId)
    );
    if (already) {
      return res.status(400).json({
        success: false,
        message: 'Already registered for this class.',
      });
    }

    if (classSession.registeredStudents.length >= classSession.capacity) {
      return res.status(400).json({
        success: false,
        message: 'This class is full.',
      });
    }

    classSession.registeredStudents.push(studentId);
    await classSession.save();
    await Student.updateOne({ _id: studentId }, { $set: { lastActiveAt: new Date() } });

    return res.status(201).json({
      success: true,
      message: 'Successfully registered for the class.',
      class: toPublicClass(classSession, studentId, true),
    });
  } catch (error) {
    console.error('Register class error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to register for this class. Please try again.',
    });
  }
};

/**
 * POST /api/classes — volunteer only
 */
const createClass = async (req, res) => {
  try {
    const {
      skill,
      title,
      description,
      date,
      day,
      time,
      startTime,
      endTime,
      location,
      communityCentre,
      facilitator,
      volunteerName,
      capacity,
      availableSeats,
      linkUrl,
      fileData,
      fileName,
    } = req.body;

    if (typeof skill !== 'string' || !skill.trim() || !date || !day || !ALLOWED_DAYS.includes(day)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class data. Skill, date and day are required.',
      });
    }

    let start = startTime;
    let end = endTime;
    if ((!start || !end) && time) {
      const parsed = parseTimeRange(time);
      if (!parsed) {
        return res.status(400).json({
          success: false,
          message: 'Invalid time. Use format like "10:00 AM - 11:00 AM".',
        });
      }
      start = parsed.startTime;
      end = parsed.endTime;
    }

    const centre = (communityCentre || location || '').trim();
    const fac = (facilitator || volunteerName || '').trim();
    const seats = Number(capacity ?? availableSeats);

    if (!start || !end || !centre || !fac || !seats || seats < 1) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled. Seats must be greater than 0.',
      });
    }

    if (!isWeekendOrHolidaySession(day, date)) {
      return res.status(400).json({
        success: false,
        message: 'Class must be scheduled on Saturday, Sunday, or an approved holiday.',
      });
    }

    const normalizedLink = typeof linkUrl === 'string' ? linkUrl.trim() : '';
    if (normalizedLink) {
      try {
        const parsedLink = new URL(normalizedLink);
        if (!['http:', 'https:'].includes(parsedLink.protocol)) throw new Error('Unsupported URL protocol.');
      } catch {
        return res.status(400).json({ success: false, message: 'Provide a valid HTTP or HTTPS class link.' });
      }
    }
    const attachmentError = validateBase64Attachment(fileData);
    if (attachmentError) {
      return res.status(400).json({ success: false, message: attachmentError });
    }

    const classSession = await ClassSession.create({
      skill: skill.trim(),
      title: (title || `${skill.trim()} Workshop`).trim(),
      description:
        (description || `Community learning session for ${skill.trim()}.`).trim(),
      date,
      day,
      startTime: start,
      endTime: end,
      location: centre,
      facilitator: fac,
      capacity: seats,
      registeredStudents: [],
      linkUrl: normalizedLink,
      fileData: typeof fileData === 'string' ? fileData : '',
      fileName: typeof fileName === 'string' ? fileName.trim() : '',
    });

    return res.status(201).json({
      success: true,
      message: 'Community class created successfully.',
      class: toPublicClass(classSession),
    });
  } catch (error) {
    console.error('Create class error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to create class. Please try again.',
    });
  }
};

/**
 * PUT /api/classes/:id — volunteer only
 */
const updateClass = async (req, res) => {
  try {
    const classSession = await ClassSession.findById(req.params.classId || req.params.id);
    if (!classSession) {
      return res.status(404).json({
        success: false,
        message: 'Class not found.',
      });
    }

    const registeredCount = classSession.registeredStudents.length;
    const {
      date,
      day,
      time,
      startTime,
      endTime,
      location,
      communityCentre,
      facilitator,
      volunteerName,
      capacity,
      availableSeats,
      description,
      title,
      skill,
      linkUrl,
      fileData,
      fileName,
    } = req.body;

    if (day && !ALLOWED_DAYS.includes(day)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid day. Use Saturday, Sunday, or Holiday.',
      });
    }

    if (date !== undefined) classSession.date = date;
    if (day !== undefined) classSession.day = day;
    if (title !== undefined) classSession.title = title.trim();
    if (description !== undefined) classSession.description = description.trim();
    if (skill !== undefined) {
      if (typeof skill !== 'string' || !skill.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Course or skill name cannot be empty.',
        });
      }
      classSession.skill = skill.trim();
    }

    if (linkUrl !== undefined) {
      const normalizedLink = typeof linkUrl === 'string' ? linkUrl.trim() : '';
      if (normalizedLink) {
        try {
          const parsedLink = new URL(normalizedLink);
          if (!['http:', 'https:'].includes(parsedLink.protocol)) throw new Error('Unsupported URL protocol.');
        } catch {
          return res.status(400).json({ success: false, message: 'Provide a valid HTTP or HTTPS class link.' });
        }
      }
      classSession.linkUrl = normalizedLink;
    }
    if (fileData !== undefined) {
      const attachmentError = validateBase64Attachment(fileData);
      if (attachmentError) {
        return res.status(400).json({ success: false, message: attachmentError });
      }
      classSession.fileData = typeof fileData === 'string' ? fileData : '';
    }
    if (fileName !== undefined) {
      classSession.fileName = typeof fileName === 'string' ? fileName.trim() : '';
    }

    if (time) {
      const parsed = parseTimeRange(time);
      if (!parsed) {
        return res.status(400).json({
          success: false,
          message: 'Invalid time. Use format like "10:00 AM - 11:00 AM".',
        });
      }
      classSession.startTime = parsed.startTime;
      classSession.endTime = parsed.endTime;
    }
    if (startTime) classSession.startTime = startTime;
    if (endTime) classSession.endTime = endTime;

    const centre = communityCentre ?? location;
    if (centre !== undefined) classSession.location = String(centre).trim();

    const fac = facilitator ?? volunteerName;
    if (fac !== undefined) classSession.facilitator = String(fac).trim();

    const seatsRaw = capacity ?? availableSeats;
    if (seatsRaw !== undefined) {
      const seats = Number(seatsRaw);
      if (!seats || seats < 1) {
        return res.status(400).json({
          success: false,
          message: 'Seats must be greater than 0.',
        });
      }
      if (seats < registeredCount) {
        return res.status(400).json({
          success: false,
          message: 'Available seats cannot be less than registered students.',
        });
      }
      classSession.capacity = seats;
    }

    if (!isWeekendOrHolidaySession(classSession.day, classSession.date)) {
      return res.status(400).json({
        success: false,
        message: 'Class must be scheduled on Saturday, Sunday, or an approved holiday.',
      });
    }

    await classSession.save();

    return res.json({
      success: true,
      message: 'Class updated successfully.',
      class: toPublicClass(classSession, null, true),
    });
  } catch (error) {
    console.error('Update class error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to update class. Please try again.',
    });
  }
};

/**
 * DELETE /api/classes/:id — volunteer only
 * Block delete if students are registered
 */
const deleteClass = async (req, res) => {
  try {
    const classSession = await ClassSession.findById(req.params.classId || req.params.id);
    if (!classSession) {
      return res.status(404).json({
        success: false,
        message: 'Class not found.',
      });
    }

    if (classSession.registeredStudents.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This class already has registered students. Please do not delete it.',
      });
    }

    await classSession.deleteOne();

    return res.json({
      success: true,
      message: 'Class deleted successfully.',
    });
  } catch (error) {
    console.error('Delete class error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to delete class. Please try again.',
    });
  }
};

module.exports = {
  getClasses,
  getClassById,
  registerForClass,
  getMyRegistrations,
  createClass,
  updateClass,
  deleteClass,
  toPublicClass,
};
