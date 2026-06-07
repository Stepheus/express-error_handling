class ValidationError extends Error {
    constructor(message){
        super(message);

        this.code = 407;
        this.name = "ValidationError";
    }
};

class InvalidUserError extends Error {
    constructor(message){
        super(message);

        this.code = 407;
        this.name = "InvalidUserError";
    }
};

class AuthenticationFailed extends Error {
    constructor(message){
        super(message);

        this.code = 407;
        this.name = "AuthenticationFailed";
    }
};

module.exports = {ValidationError, InvalidUserError, AuthenticationFailed};


