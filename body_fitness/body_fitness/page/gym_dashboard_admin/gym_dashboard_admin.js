frappe.provide('frappe.gym-dashboard-admin');
frappe.pages['gym-dashboard-admin'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __('Gym Dashboard for Admin')
	});

	let gym_dashboard = new GymDashboardforAdmin(wrapper);
	$(wrapper).bind('show', ()=> {
		gym_dashboard.show();
	});

	// let $btn = page.set_primary_action('Refresh', () => {gym_dashboard.show()}, 'octicon octicon-plus');

};

class GymDashboardforAdmin {
	constructor(wrapper) {
 		this.wrapper = $(wrapper);
        this.main_section = this.wrapper.find('.page-wrapper');
	}


	show() {
		this.main_section.append(`
			<div class="row main-section-layout">
				<div class="col-lg-6 col-6 col-md-12 col-sm-12">
					<div class="row">
						<div class="col-lg-12  col-12 col-md-12 col-sm-12 fee-due-list">
						<h3 style="text-align: center; font-family: inherit; line-height: 1.3em; font-family: Times New Roman, Times, serif;">Due Fee</h3></div>
					</div>

					<div class="row">
						<div class="col-lg-12  col-12 col-md-12 col-sm-12 trainer-attendance">
							<h3 style="text-align: center; font-family: inherit; line-height: 1.3em; font-family: Times New Roman, Times, serif;">Trainer Attendance</h3>
							${this.trainerAttendance()}
						</div>
					</div>

				</div>
				<div class="col-lg-6 col-6 col-md-12 col-sm-12 member-trainer-details"></div>
			</div>
			`)
		this.main_section.find('.fee-due-list').append(this.feeDue()); // Append feedDue html to fee-due-list section
		
		// Load member details and graph charts 
		this.memberTrainerDetails()


		// var dataset = {
		// 	'labels': ['Male', 'Female'],
		// 	'datasets': [{'values': [50, 50]}]
		// }
		// this.membersSexChart(dataset)
		// frappe.breadcrumbs.add('Body Fitness');
		// this.sidebar.empty();
		// let me = this;
		// let patient = frappe.ui.form.make_control({
		// 	parent: me.sidebar,
		// 	df: {
		// 		fieldtype: 'Link',
		// 		options: 'Patient',
		// 		fieldname: 'patient',
		// 		placeholder: __('Select Patient'),
		// 		only_select: true,
		// 		change: () => {
		// 			me.patient_id = '';
		// 			if (me.patient_id != patient.get_value() && patient.get_value()) {
		// 				me.start = 0;
		// 				me.patient_id = patient.get_value();
		// 				me.make_patient_profile();
		// 			}
		// 		}
		// 	}
		// });

		// if (frappe.route_options && !this.patient_id) {
		// 	patient.set_value(frappe.route_options.patient);
		// 	this.patient_id = frappe.route_options.patient;
		// }

		// this.sidebar.find('[data-fieldname="patient"]').append('<div class="patient-info"></div>');
	}


	feeDue() {
		let htmlOut = ``
		frappe.call({
			method: 'body_fitness.body_fitness.page.gym_dashboard_admin.gym_dashboard_admin.get_due_fee_data',
			args: {
				filters: {'key1': 'Test'}
			},
			async: false,
			callback: (r) => {
				var data = r.message;

				if (data.length > 0){
					htmlOut += `<table style="width: 100%;" class="fee-due-table">`
					htmlOut += `<tr style="width: 100%;" class="">
							<th style="width: 35%; font-weight: bold; text-align: middle; padding: 5px;">Member</th>
							<th style="width: 35%; font-weight: bold; text-align: middle; text-align: center; padding: 5px;">Record</th>
							<th style="width: 15%; font-weight: bold; text-align: middle; padding: 5px;">Due Date</th>
							<th style="width: 15%; font-weight: bold; text-align: middle; padding: 5px; text-align: right;">Amount</th>
						</tr>
					`
					
					// Add records of today due fee
					var todayDueFeeArray = data[0];
					todayDueFeeArray.forEach(function(record) {
						htmlOut += `<tr style="width: 100%;" class="bg-success">
							<td style="width: 35%; text-align: middle;">${record.member}</td>
							<td style="width: 35%; text-align: middle; text-align: center;">${record.record}</td>
							<td style="width: 15%; text-align: middle;">${record.due_date}</td>
							<td style="width: 15%; text-align: middle; text-align: right">${record.grand_total}</td>
						</tr>`
					})

					// Add records of fee that is due in next 2-3 days
					var less3DaysDueFeeArray = data[1]
					less3DaysDueFeeArray.forEach(function(record) {
						htmlOut += `<tr style="" class="bg-warning">
							<td style="width: 35%; text-align: middle;">${record.member}</td>
							<td style="width: 35%; text-align: middle;text-align: center;">${record.record}</td>
							<td style="width: 15%; text-align: middle;">${record.due_date}</td>
							<td style="width: 15%; text-align: middle; text-align: right">${record.grand_total}</td>
						</tr>`
					})

					// Add records of fee that is due in after next 3 days
					var above3DaysDueFeeArray = data[2]
					above3DaysDueFeeArray.forEach(function(record) {
						htmlOut += `<tr style="" class="bg-danger">
							<td style="width: 35%; text-align: middle;">${record.member}</td>
							<td style="width: 35%; text-align: middle; text-align: center;">${record.record}</td>
							<td style="width: 15%; text-align: middle;">${record.due_date}</td>
							<td style="width: 15%; text-align: middle; text-align: right">${record.grand_total}</td>
						</tr>`
					})
				}

				else {
				htmlOut += `
					<tr>
						<td colspan='4' style="text-align: center;">No records found.</td>
					</tr>
					`
				}
				htmlOut +=`</table>`
			},
			error: (r) => {
				htmlOut+= `No records found.`
			}
		})

		return htmlOut
	}

	trainerAttendance(){
		var htmlOut = ``
		htmlOut += `<table style="width: 100%;" class="trainer-attendance-table">`
		htmlOut += `<tr style="background-color:lighgrey; width: 100%;">
				<th style="width: 40%; font-weight: bold; text-align: middle; padding: 5px;">Trainer</th>
				<th style="width: 20%; font-weight: bold; text-align: middle; padding: 5px;">Date</th>
				<th style="width: 20%; font-weight: bold; text-align: middle; padding: 5px;">Time In</th>
				<th style="width: 20%; font-weight: bold; text-align: middle; padding: 5px;">Time Out</th>
			</tr>
		`

		frappe.call({
			method: 'body_fitness.body_fitness.page.gym_dashboard_admin.gym_dashboard_admin.get_trainer_attendance_data',
			args: {
				filters: {'key1': 'Test'}
			},
			async: false,
			callback: (r) => {
				var data = r.message;
				if (data.length > 0){
					data.forEach(function(record) {
						// body...
						var timeIn = '';
						var timeOut = '';
						if(record.log_type=='IN'){timeIn = record.time} else {timeOut = record.time};
						
						htmlOut += `
						<tr>
							<th style="width: 40%; font-weight: bold; text-align: middle; padding: 5px;">${record.employee_name}</th>
							<th style="width: 20%; font-weight: bold; text-align: middle; padding: 5px;">${record.attendance_date}</th>
							<th style="width: 20%; font-weight: bold; text-align: middle; padding: 5px;">${record.log_time}</th>
							<th style="width: 20%; font-weight: bold; text-align: middle; padding: 5px;">${record.log_time}</th>
						</tr>
						`

					})
				}
				else {
					htmlOut += `
						<tr>
							<td colspan='4' style="text-align: center;">No records found.</td>
						</tr>
					`
				}

			}
		})
		htmlOut += `</table>`
		return htmlOut
	}

	memberTrainerDetails(){
		let htmlOut = ``
		frappe.call({
			method: 'body_fitness.body_fitness.page.gym_dashboard_admin.gym_dashboard_admin.get_member_trainer_data',
			args: {
				filters: {'key1': 'Test'}
			},
			async: false,
			callback: (r) => {
				var data = r.message;

				htmlOut += `
					<div class="members-count-section row">
						<div class="col-lg-3 members-count"></div>
						<div class="col-lg-6 members-count">
							<div class="card text-white bg-info mb-3" style="max-width: 18rem;">
							  <div class="card-header">Active Members</div>
							  <div class="card-body">
							    <p class="card-text">${data[0][0].active_members_count}</p>
							  </div>
							</div>
						</div>
						<div class="col-lg-3 members-count"></div>
					</div>`
				// htmlOut += `<table>
				// <tr>
				// 	<th>Member</th>
				// 	<th>Mobile</th>
				// </tr>
				// `
				// let membersData = data[0];
				// membersData.forEach(function(record) {
				// 	htmlOut += `<tr>
				// 		<td>${record.name}</td>
				// 		<td>${record.mobile}</td>
				// 	</tr>`
				// })
				// htmlOut +=`</table>`

				this.main_section.find('.member-trainer-details').append(htmlOut);
				this.main_section.find('.member-trainer-details').append(`
					<div class="row graphs-main-section graphs-section-1">
						<div class="sex-chart col-lg-6"></div>
						<div class="trainer-chart col-lg-6"></div>
					</div>

					<div class="row graphs-main-section graphs-section-2">
						<div class="package-chart col-lg-12"></div>
					</div>
					`)
				// this.main_section.find('.member-trainer-details').append(`<div class="trainer-chart"></div>`)
				// this.main_section.find('.member-trainer-details').append(`<div class="package-chart"></div>`)
				let graphSexDataset = data[1];
				this.membersSexChart(graphSexDataset)

				let graphTrainerDataset = data[2];
				this.membersTrainerChart(graphTrainerDataset)

				let graphPackageDataset = data[3];
				this.membersPackageChart(graphPackageDataset)

			},
			error: (r) => {
				htmlOut+= `No records found.`
			}
		})

		return htmlOut
	}


	membersSexChart(dataset) {
		const sexChart = new frappe.Chart(".sex-chart", {
			title: "Male/Female",
			data: dataset,
			type: "pie",
			height: 360,
			colors: ['#FFBF00', '#40E0D0']
		});
	}

	membersTrainerChart(dataset) {
		const trainerChart = new frappe.Chart(".trainer-chart", {
			title: "Trainer",
			data: dataset,
			type: "pie",
			height: 360,
			colors: ['#FFBF00', '#40E0D0']
		});
	}

	membersPackageChart(dataset) {
		const packageChart = new frappe.Chart(".package-chart", {
			title: "Package",
			data: dataset,
			type: "pie",
			height: 360,
			colors: ['#FFBF00', '#40E0D0']
		});
	}
}