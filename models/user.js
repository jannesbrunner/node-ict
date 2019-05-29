/**
 * User Model
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

const db = require('../util/database');
const bcrypt = require('bcryptjs')
// Model

exports.updatePw = async (id, newPw) => {
  try {
    const pw = await bcrypt.hash(newPw, 12)
    const user = await db.user.findByPk(id)
    if (!user) {
      throw new Error(`DB Update User PW Error: User with id ${id} is ${user}`)
    }
    user.password = pw;
    await user.save();
    return true;
  } catch (error) {
    return error;
  }
};

exports.save = async (user) => {
  try {
    
    if (user.id) {
      const foundUser = await db.User.findByPk(user.id)

      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12)
      }

      for (let prop in user) {
        foundUser[prop] = user[prop]
      }

      return await foundUser.save();
    }
    const pw = await bcrypt.hash(user.password, 12)
    return await db.User.create({
      name: user.name,
      email: user.email,
      password: pw,
      isSuperAdmin: user.isSuperAdmin ? user.isSuperAdmin : false,
      canLogIn: user.canLogIn ? user.canLogIn : false,
    })

  }
  catch (error) {
    return error;
  }

}


exports.checkPassword = async (pw1, pw2) => {
  try {
    return await bcrypt.compare(pw1, pw2);
  } catch (error) {
    throw new Error("Decrypt Error: " + error)
  }
}

exports.getUsers = async () => {
  try {
    return await db.User.findAll();

  } catch (error) {
    throw new Error("Get Users DB Error: " + error)
  }
}


exports.getUser = async (request) => {
  try {
    const userData = await db.User.findOne({ where: { ...request } })
    if(userData) {
    return userData.dataValues;
    } else {
      return null;
    }
  } catch (error) {
    throw new Error("DB Get User Error " + error)
  }
}



