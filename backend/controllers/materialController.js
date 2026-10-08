const Material = require('../models/Material');
const { validateBase64Attachment } = require('../utils/attachmentValidation');

const includeLegacyResourceFields = (material) => ({
  ...material,
  contentType:
    material.contentType ||
    (material.type === 'video' ? 'Video' : material.type === 'document' ? 'Document' : 'Custom'),
  linkUrl: material.linkUrl || material.videoUrl || '',
});

const addMaterial = async (req, res) => {
  try {
    const {
      title,
      skill,
      contentType,
      linkUrl,
      fileData,
      fileName,
      language,
      description,
      contentNotes,
    } = req.body;

    if (typeof title !== 'string' || !title.trim() || typeof skill !== 'string' || !skill.trim()) {
      return res.status(400).json({ success: false, message: 'Title and course or skill are required.' });
    }

    const normalizedLink = typeof linkUrl === 'string' ? linkUrl.trim() : '';
    const normalizedFile = typeof fileData === 'string' ? fileData.trim() : '';
    const attachmentError = validateBase64Attachment(normalizedFile);
    if (attachmentError) {
      return res.status(400).json({ success: false, message: attachmentError });
    }
    if (!normalizedLink && !normalizedFile) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one resource: a web link or an attached file.',
      });
    }

    const material = await Material.create({
      title: title.trim(),
      skill: skill.trim(),
      contentType: typeof contentType === 'string' && contentType.trim() ? contentType.trim() : 'Custom',
      linkUrl: normalizedLink,
      fileData: normalizedFile,
      fileName: typeof fileName === 'string' ? fileName.trim() : '',
      language: typeof language === 'string' && language.trim() ? language.trim() : 'Tamil',
      description: typeof description === 'string' ? description.trim() : '',
      contentNotes: typeof contentNotes === 'string' ? contentNotes.trim() : '',
      uploadedBy: req.user._id,
      uploaderName: req.user.name,
    });

    return res.status(201).json({
      success: true,
      message: 'Course material added successfully.',
      material,
    });
  } catch (error) {
    console.error('Add material error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to add material. Please try again.' });
  }
};

const getMyMaterials = async (req, res) => {
  try {
    const materials = (await Material.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 })
      .lean()).map(includeLegacyResourceFields);
    return res.json({ success: true, materials });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMaterialsBySkill = async (req, res) => {
  try {
    const { skill } = req.params;
    const filter = skill
      ? { skill: new RegExp(`^${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      : {};
    const materials = (await Material.find(filter).sort({ createdAt: -1 }).lean())
      .map(includeLegacyResourceFields);
    return res.json({ success: true, materials });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'மெட்டீரியல் கிடைக்கவில்லை.' });
    }

    if (String(material.uploadedBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'அனுமதி இல்லை.' });
    }

    await material.deleteOne();
    return res.json({ success: true, message: 'மெட்டீரியல் வெற்றிகரமாக நீக்கப்பட்டது.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addMaterial,
  getMyMaterials,
  getMaterialsBySkill,
  deleteMaterial,
};