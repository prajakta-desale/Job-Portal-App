import baseModel from "../BaseModel";
export class UserModel extends baseModel {
  constructor() {
    super();
  }
  async getUser(data: any) {
    return await this._executeQuery(
      "select id,role_id,concat(first_name, last_name)as username, email, password,status from user where email = ?  ",
      [data.email]
    );
  }
  async getUserRole(role: string) {
    let result = await this._executeQuery(
      "select id,name, status from user_roles where name = ? ",
      [role]
    );
    return result;
  }

  async createUser(userData: any) {
    let tableName = "user";
    console.log("in model ------------->", tableName, userData);
    let registerResult = await this._executeQuery(
      `INSERT INTO ${tableName} SET ?`,
      [userData]
    );
    return registerResult;
  }
  // get user-id for registered user
  async getUserId() {
    let result = await this._executeQuery("select * from user ", []);
    return result;
  }
  async getUserByGoogleId(googleId: any) {
    return await this._executeQuery(
      "select id,first_name, last_name,email from user where googleId = ?",
      [googleId]
    );
  }
  async createUserByGoogleAuth(userData: any) {
    const result = await this._executeQuery("insert into user set ?", [
      userData,
    ]);
    return result;
  }
  async getUserById(id: any) {
    return await this._executeQuery(
      "select id,role_id,concat(first_name, last_name)as username, email, password,status from user where id = ?  ",
      [id]
    );
  }
  async createUserProfile(userData: any) {
    const result = await this._executeQuery("insert into user_profile set ?", [
      userData,
    ]);
    console.log("in model----->", result);
    return result;
  }
}
