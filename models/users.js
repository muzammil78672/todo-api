var bcrypt = require('bcrypt');
var _ = require('underscore');
var crypto = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function (sequelize, DataTypes){
	var user =  sequelize.define ('user', {
	email: {
		type: DataTypes.STRING,
		allowNull : false,
		unique: true,
		validate: {
			isEmail: true,
			notEmpty: false
		}
	},
	salt: {
		type: DataTypes.STRING
	},
	password_hash: {
		type: DataTypes.STRING
	},
	password: {
		type: DataTypes.VIRTUAL,
		allowNull: false,
		validate: {
				len: [7, 100],
				notEmpty: false
			},
		set: function (value){
			var salt = bcrypt.genSaltSync(10);
			var hashPassword = bcrypt.hashSync(value, salt);

			this.setDataValue('password', value);
			this.setDataValue('salt', salt);
			this.setDataValue('password_hash', hashPassword);
		}
	}
},{
	hooks: {

		beforeValidate: function (user, options){
			if (typeof user.email === 'string') {
				user.email = user.email.toLowerCase();
			}
		}

	},
	classMethods: {

		authenticate: function(body){
			return new Promise (function (resolve, reject){
				if (typeof body.email !== 'string' || typeof body.password !== 'string'){
						return reject();
					}

						user.findOne({
									where: {
										email: body.email
										}
						}).then (function (user){
					if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
			 					return reject();
							}	


							resolve(user);
						//res.json(user.toPublicJSON());
						},function (e){
							reject();
					});
				});
			},
			findByToken: function (token){
				return new Promise (function (resolve, reject){
					try{
						var decodeJWT = jwt.verify(token, 'qwert123');
						var bytes = crypto.AES.decrypt(decodeJWT.token, 'abc@123');
						var tokenData = JSON.parse(bytes.toString(crypto.enc.Utf8));

						user.findById(tokenData.id).then(function (user){
							if (user) {
								resolve(user);
							}else{
								reject(user);
							}
						},function (e){
							reject();
						});
					}catch (e){
						reject();
					}
				});
			}
		},
	instanceMethods: {
		toPublicJSON: function(){
			var json = this.toJSON();
			return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
		},
		generateToken: function(type){
			if (!_.isString(type)){
				return undefined ;
			}

			try{

				var stringData = JSON.stringify({id: this.get('id'), type: type});
				var encryptedData = crypto.AES.encrypt(stringData, 'abc@123').toString();
				var token = jwt.sign({
					token: encryptedData
				}, 'qwert123');
				return token ;
			}catch (e){
				return undefined ;
			}
		}
	}



	});

	return user ;
};