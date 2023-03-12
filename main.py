import zipfile
from io import BytesIO

from flask_cors import CORS, cross_origin

from flask import Flask, request, send_file
from energy_graphs import daily_consumption, monthly_consumption

app = Flask(__name__)
CORS(app)


@app.route('/')
def hello():
    return 'Hello, World!'


@app.route('/generate_graphs', methods=['POST'])
@cross_origin()
def home():
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
    # return 'abcd'


if __name__ == '__main__':
    app.run()
