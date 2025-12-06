const search = async (Model, req, res) => {
  // console.log(req.query.fields)
  // if (req.query.q === undefined || req.query.q.trim() === '') {
  //   return res
  //     .status(202)
  //     .json({
  //       success: false,
  //       result: [],
  //       message: 'No document found by this request',
  //     })
  //     .end();
  // }
  // Default fields based on model - use a more generic approach
  const defaultFields = ['name', 'email', 'title', 'settingKey', 'notes', 'description'];
  const fieldsArray = req.query.fields ? req.query.fields.split(',') : defaultFields;
  
  // Check if q parameter exists
  if (!req.query.q || req.query.q.trim() === '') {
    return res.status(202).json({
      success: false,
      result: [],
      message: 'No document found by this request',
    });
  }

  const fields = { $or: [] };

  for (const field of fieldsArray) {
    fields.$or.push({ [field]: { $regex: new RegExp(req.query.q, 'i') } });
  }
  // console.log(fields)

  let results = await Model.find({
    ...fields,
  })

    .where('removed', false)
    .limit(20)
    .exec();

  if (results.length >= 1) {
    return res.status(200).json({
      success: true,
      result: results,
      message: 'Successfully found all documents',
    });
  } else {
    return res
      .status(202)
      .json({
        success: false,
        result: [],
        message: 'No document found by this request',
      })
      .end();
  }
};

module.exports = search;
