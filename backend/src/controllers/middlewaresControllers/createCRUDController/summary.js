const summary = async (Model, req, res) => {
  //  Query the database for a list of all results
  const countPromise = Model.countDocuments({
    removed: false,
  });

  let resultsPromise;
  if (req.query.filter && req.query.equal) {
    resultsPromise = Model.countDocuments({
      removed: false,
    })
      .where(req.query.filter)
      .equals(req.query.equal)
      .exec();
  } else {
    resultsPromise = Model.countDocuments({
      removed: false,
    }).exec();
  }
  // Resolving both promises
  const [countFilter, countAllDocs] = await Promise.all([resultsPromise, countPromise]);

  if (countAllDocs > 0) {
    return res.status(200).json({
      success: true,
      result: { countFilter, countAllDocs },
      message: 'Successfully count all documents',
    });
  } else {
    return res.status(203).json({
      success: false,
      result: [],
      message: 'Collection is Empty',
    });
  }
};

module.exports = summary;
