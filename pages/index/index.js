let db = wx.cloud.database().collection("content")

function randomCode(size) {
	var seed = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'p', 'Q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '2', '3', '4', '5', '6', '7', '8', '9']; // 密码源数组
	var n = '';
	for (var i = 0; i < size; i++) {
		let t = Math.round(Math.random() * (seed.length - 1));
		n += seed[t];
	}
	return n;
}
Page({
	addData() {
		db.add({
			data: {
				addtime: new Date(),
				edittime: new Date(),
				banner: "http://example.kkslide.fun/banner.jpg",
				name: "AAA"
			},
			success(res) {
				console.log("success!", res);
			},
			fail(err) {
				console.log("error!!!", err);
			}
		})
	},
	getData() {
		db.get().then(res => {
			console.log(res);
		})
	},
	getCloudFunc() {
		wx.cloud.callFunction({
			name: "addHandler",
			data: {
				collection: "category",
				formData: {
					name: randomCode(6),
					banner: randomCode(10) + ".jpg"
				}
			},
			success: function (res) {
				console.log("云函数结果", res)
			},
			fail: console.error
		})
	},
	// getCloudFunc2() {
	//   wx.cloud.callFunction({
	//     name: "getHandler",
	//     data: {
	//       collection: "category"
	//     },
	//     success: function (res) {
	//       console.log("云函数结果", res)
	//     },
	//     fail: console.error
	//   })
	// }
	getAggregate() {
		wx.cloud.callFunction({
			name: "getHandler",
			data: {
				collection: "content"
			},
			success: function (res) {
				console.log("云函数结果", res)
			},
			fail: console.error
		})
	},
	getThatData(){
		wx.cloud.callFunction({
			name:"updateHandler",
			success:res=>{
				console.log(res);
			},
			fail:err=>{
				console.log(err);
			}
		})
	}
})