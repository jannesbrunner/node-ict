/**
 * User Model
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

const db = require('../util/database');
const bcrypt = require('bcryptjs')
// Model
module.exports = class User{
  constructor(name, email, password, isSuperAdmin=false, canLogIn=false, id=null) {
    this.name = name
    this.email = email
    this.password = password
    this.isSuperAdmin = isSuperAdmin
    this.canLogIn = canLogIn
    this.id = id
  }
  set id(val) {
    this.id = val;
  }

  get id() {
    return this.id
  }

  set name(val) {
    this.name = name;
  }

  get name() {
    return this.name;
  }

  set isSuperAdmin(val) {
    this.isSuperAdmin = val;
  }

  get isSuperAdmin() {
    return this.isSuperAdmin
  }

  set canLogIn(val) {
    this.canLogIn = val;
  }

  get canLogIn() {
    return this.canLogIn;
  }

  set password(val) {
    bcrypt.hash(val, 12).then( 
      (result) => { this.password = result}).catch( 
      (error) => { throw new Error("Hash Error: " + error)})
  }
  get password() {
    return this.password
  }

  async save() {
    try {
      // user has never been saved yet, so create him 
      if(!this.id) {
        const savedUser = await db.User.create({
          name: this.name,
          email: this.email,
          password: this.password,
          isSuperAdmin: false,
          canLogIn: false,
        })
        this.id = savedUser.id;
        return true;
        // user has an id, so save him
      } else {
        
        const user = await db.user.findByPk(this.id);
        if(user) {
        user.name = this.name
        user.email = this.email
        user.password = this.password
        user.isSuperAdmin = this.isSuperAdmin
        user.canLogIn = this.canLogIn
        await user.save();
        } else {
          throw new Error(`Cannot find user with id: ${this.id}`);
        }
      }
      
    } catch (error) {
      throw new Error("Save User DB Error: " + error)
    }
   
  }
  async checkPassword(pw) {
    try {
      return await bcrypt.compare(pw, this.password);
    } catch (error) {
      throw new Error("Decrypt Error: " + error)
    }
  }

  static async getUsers() {
   try {
     const foundUsers = await db.user.findAll();
     const users = [];

     for(let user in foundUsers) {
       users.push(new User(user.name, user.email, user.password, user.isSuperAdmin, user.canLogIn, user.id))
     }
     return users;

   } catch (error) {
     throw new Error("Get Users DB Error: " + error)
   }
  }
  static async getUser(request) {
   try {
    let userData = await db.User.findOne({ where: { ...request } })
    let user = new User(
      userData.dataValues.name,
      userData.dataValues.email,
      userData.dataValues.password,
      userData.dataValues.isSuperAdmin,
      userData.dataValues.canLogIn,
      userData.dataValues.id,
      )
      console.log(user);
   } catch (error) {
     throw new Error("DB Get User Error " + error)
   }
    
  

  }
    
  
}

