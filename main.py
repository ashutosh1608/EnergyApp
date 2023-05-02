import zipfile
from io import BytesIO

from flask_cors import CORS, cross_origin

from flask import Flask, request, send_file, make_response, Response
from energy_graphs import daily_consumption, monthly_consumption
from energy_excel import sheet1

app = Flask(__name__)
CORS(app)


@app.route('/')
def hello():
    return 'Hello, World!'


@app.route('/generate_graphs', methods=['POST'])
@cross_origin()
def graphs():
    generation = request.files['generation']
    consumption = request.files['consumption']
    charge_per_unit = request.form['charge_per_unit']
    monthly = monthly_consumption(generation, consumption, float(charge_per_unit))
    daily = daily_consumption(generation, consumption, float(charge_per_unit))
    data = BytesIO()
    with zipfile.ZipFile(data, mode='w') as z:
        z.writestr("monthly consumption.pdf", monthly.read())
        z.writestr("energy from vs to grid.pdf", daily.read())
    data.seek(0)
    return send_file(data, as_attachment=True, download_name="graphs.zip")


@app.route('/generate_excel', methods=['POST'])
@cross_origin()
def excel():
    generation = request.files['generation']
    consumption = request.files['consumption']
    df = sheet1(generation, consumption)
    buffer = BytesIO()
    df.to_excel(buffer)
    headers = {
        'Content-Disposition': 'attachment; filename=output.xlsx',
        'Content-type': 'application/vnd.ms-excel'
    }
    return Response(buffer.getvalue(), mimetype='application/vnd.ms-excel', headers=headers)


if __name__ == '__main__':
    app.run()
