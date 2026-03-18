/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { User } from "../modules/user/user.model";
import config from ".";
import { USER_ROLE, USER_STATUS } from "../modules/user/user.const";
import AppError from "../errors/AppError";
import httpStatus from "http-status";



passport.use(
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email: string, password: string, done: (err: any, user?: any, info?: any) => void) => {
        try {
            const user = await User.isUserExistsByEmail(email);

            if (!user) {
                return done(new AppError(httpStatus.NOT_FOUND, "This user is not found !"), false);
            }

            if (user.isDeleted) {
                return done(new AppError(httpStatus.FORBIDDEN, "This user is deleted !"), false);
            }

            if (user.status === USER_STATUS.BLOCKED) {
                return done(new AppError(httpStatus.FORBIDDEN, "This user is blocked !"), false);
            }

            if (!(await User.isPasswordMatched(password, user.password as string))) {
                return done(new AppError(httpStatus.FORBIDDEN, "Password do not matched"), false);
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    })
);

passport.use(
    new GoogleStrategy(
        {
            clientID: config.google_client_id as string,
            clientSecret: config.google_client_secret as string,
            callbackURL: config.google_callback_url
        }, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {

            try {
                const email = profile.emails?.[0].value;

                if (!email) {
                    return done(null, false, { message: "No email found" })
                }

                let user = await User.findOne({ email })

                // console.log("google user", user)

                if (!user) {
                    user = await User.create({
                        email,
                        name: profile.displayName,
                        avatar: profile.photos?.[0].value,
                        role: USER_ROLE.USER,
                        isVerified: true,
                        auths: [
                            {
                                provider: "google",
                                providerId: profile.id
                            }
                        ]
                    })
                }

                return done(null, user)


            } catch (error) {
                console.log("Google Strategy Error", error);
                return done(error)
            }
        }
    )
)



passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
    done(null, user._id)
})

passport.deserializeUser(async (id: string, done: any) => {
    try {
        const user = await User.findById(id);
        done(null, user)
    } catch (error) {
        console.log(error);
        done(error)
    }
})