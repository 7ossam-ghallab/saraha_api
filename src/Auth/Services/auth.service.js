import { userModel } from "../../DB/models/user.model";


/**
 * find
 * findOne
 * findById == findByPk
 */

export const signUpService = async (res, req) => {
  try {
    const {userName, password, email, phone} = req.body;
    // const isEmailExist = await userModel.find
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}