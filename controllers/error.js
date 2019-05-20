let error = "";

exports.get404 = (req, res, next) => {
    res.status(404).render("404");
  };

exports.getError = (req, res, next) => {
    res.status(500).render("error", 
    {error: error})
}

exports.setError = (err) => {
  error = err;
}
