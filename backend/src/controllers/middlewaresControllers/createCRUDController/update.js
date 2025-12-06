const update = async (Model, req, res) => {
  // Check if document exists first
  const existingDoc = await Model.findOne({
    _id: req.params.id,
    removed: false,
  });

  if (!existingDoc) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found ',
    });
  }

  // Find document by id and updates with the required fields
  // Remove removed field from body to prevent overwriting
  const { removed, ...updateData } = req.body;
  updateData.removed = false;
  
  const result = await Model.findOneAndUpdate(
    {
      _id: req.params.id,
      removed: false,
    },
    { $set: updateData },
    {
      new: true, // return the new result instead of the old one
      runValidators: true,
    }
  ).exec();
  
  if (!result) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found ',
    });
  } else {
    return res.status(200).json({
      success: true,
      result,
      message: 'we update this document ',
    });
  }
};

module.exports = update;
