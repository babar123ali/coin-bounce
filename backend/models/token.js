const mongoose=require(`mongoose`);

const {Schema}=mongoose;

const refreshTokenSchema = Schema({
    
    token: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: `User`
    }
},
{timestamps: true}

);

//Model Creation
module.exports=mongoose.model(
    `RefreshToken`,      // model name(singular , capitalized)
    refreshTokenSchema,  // schema to use
    `tokens`);           // collection name in mongodb(optional)