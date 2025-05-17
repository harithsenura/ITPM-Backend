import mongoose from 'mongoose';

const { Schema } = mongoose;

/*
Validation part for email, NIC, and mobile
const emailValidator = (email) => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return emailRegex.test(email);
};

const nicValidator = (nic) => {
    const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
    return nicRegex.test(nic);
};

const mobileValidator = (mobile) => {
    return /^[0-9]{10}$/.test(mobile.toString());
};
*/

const employeeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        // Uncomment to add email validation
        // validate: {
        //   validator: emailValidator,
        //   message: props => `${props.value} is not a valid email address!`
        // }
    },  
    mobile: {
        type: Number,
        required: true,
        unique: true,
        // Uncomment to add mobile validation
        // validate: {
        //   validator: mobileValidator,
        //   message: props => `${props.value} is not a valid mobile number! It must be a 10-digit number.`
        // }
    },

    nic: {
        type: String,
        required: true,
        unique: true,
        // Uncomment to add NIC validation
        // validate: {
        //   validator: nicValidator,
        //   message: props => `${props.value} is not a valid NIC number!`
        // }
    },

    designation: {
        type: String,
        required: true
    },

    basicsal: {
        type: Number,
        required: true
    },

    empid: {
        type: String,
        required: true,
        unique: true
    }
});

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
