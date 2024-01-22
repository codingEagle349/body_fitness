from frappe import _
import frappe
import json
from datetime import datetime, timedelta

@frappe.whitelist()
def get_due_fee_data(filters):
	if filters: filters=json.loads(filters)
	
	SQL_QUERY_FOR_TODAY_DUE_FEE= """ 
		select m.name as member, si.name as record, si.grand_total, si.status, si.due_date, FORMAT(si.grand_total, 2) AS grand_total
		from `tabPatient` m, `tabSales Invoice` si
		where si.docstatus=1 and si.status!='Paid' and si.patient=m.name and si.customer=m.customer and si.due_date='%s'
	"""%(frappe.utils.today())

	TODAY_DUE_FEE_DATA = frappe.db.sql(SQL_QUERY_FOR_TODAY_DUE_FEE, as_dict=True)


	# Get the current date and time
	current_date = datetime.now()
	
	# Calculate the date after 3 days
	date_after_three_days = current_date + timedelta(days=-3)

	today_date = current_date.strftime("%Y-%m-%d")
	date_after_three_days = date_after_three_days.strftime("%Y-%m-%d")

	SQL_QUERY_FOR_LESS_3DAYS_DUE_FEE= """ 
		select m.name as member, si.name as record, si.grand_total, si.status, si.due_date, FORMAT(si.grand_total, 2) AS grand_total
		from `tabPatient` m, `tabSales Invoice` si
		where si.docstatus=1 and si.status!='Paid' and si.patient=m.name and si.customer=m.customer and si.due_date<'%s' and si.due_date>='%s'
	"""%(today_date, date_after_three_days)

	LESS_3DAYS_DUE_FEE_DATA = frappe.db.sql(SQL_QUERY_FOR_LESS_3DAYS_DUE_FEE, as_dict=True)


	SQL_QUERY_FOR_ABOVE_3DAYS_DUE_FEE= """ 
		select m.name as member, si.name as record, si.grand_total, si.status, si.due_date, FORMAT(si.grand_total, 2) AS grand_total
		from `tabPatient` m, `tabSales Invoice` si
		where si.docstatus=1 and si.status!='Paid' and si.patient=m.name and si.customer=m.customer and si.due_date<'%s'
	"""%(date_after_three_days)

	ABOVE_3DAYS_DUE_FEE_DATA = frappe.db.sql(SQL_QUERY_FOR_ABOVE_3DAYS_DUE_FEE, as_dict=True)


	return [TODAY_DUE_FEE_DATA, LESS_3DAYS_DUE_FEE_DATA, ABOVE_3DAYS_DUE_FEE_DATA]


@frappe.whitelist()
def get_member_trainer_data(filters):
	if filters: filters=json.loads(filters)

	# Query for list of active members and their count
	SQL_QUERY = """ 
		select name, COUNT(name) as active_members_count from `tabPatient` where status='Active'
	"""

	gym_members_data = frappe.db.sql(SQL_QUERY, as_dict=True)


	# Query for sex wise graph dataset
	SQL_QUERY_DATASET_SEX = """ 
		select sex, COUNT(name) as active_members_count from `tabPatient` where status='Active'
		group by sex
	"""

	graph_data_sex = frappe.db.sql(SQL_QUERY_DATASET_SEX, as_dict=True)
	
	graph_sex_dataset = {'labels': [], 'datasets': [{'values': []}]}
	for sex in graph_data_sex:
		graph_sex_dataset['labels'].append(sex.sex)
		graph_sex_dataset['datasets'][0]['values'].append(sex.active_members_count)




	# Query for trainer wise graph dataset
	SQL_QUERY_DATASET_TRAINER = """ 
		select trainer_full_name, COUNT(name) as active_members_count from `tabPatient` where status='Active'
		group by trainer
	"""

	graph_data_trainer = frappe.db.sql(SQL_QUERY_DATASET_TRAINER, as_dict=True)
	graph_trainer_dataset = {'labels': [], 'datasets': [{'values': []}]}
	for tr in graph_data_trainer:
		graph_trainer_dataset['labels'].append(tr.trainer_full_name)
		graph_trainer_dataset['datasets'][0]['values'].append(tr.active_members_count)

	# Query for package/item wise graph dataset
	SQL_QUERY_DATASET_PACKAGE = """ 
		select package_name, COUNT(name) as active_members_count from `tabPatient` where status='Active'
		group by package_name
	"""

	graph_data_package = frappe.db.sql(SQL_QUERY_DATASET_PACKAGE, as_dict=True)
	graph_package_dataset = {'labels': [], 'datasets': [{'values': []}]}
	for p in graph_data_package:
		graph_package_dataset['labels'].append(p.package_name)
		graph_package_dataset['datasets'][0]['values'].append(p.active_members_count)

	return [gym_members_data, graph_sex_dataset, graph_trainer_dataset, graph_package_dataset]



@frappe.whitelist()
def get_trainer_attendance_data(filters):

	SQL_QUERY = """
		SELECT employee_name, DATE(time) as attendance_date, TIME(time) as log_time, log_type
		FROM `tabEmployee Checkin` where DATE(time)='%s' group by employee, attendance_date
	"""%(frappe.utils.today())

	data = frappe.db.sql(SQL_QUERY, as_dict=True)

	# data = []
	# for d in query_data:
	# 	row = {}
	# 	row["employee_name"] = d.employee_name
	# 	row["attendance_date"] = d.attendance_date
	# 	row[]
	# 	data.append({})

	return data