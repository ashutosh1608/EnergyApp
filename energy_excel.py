import pandas as pd


def sheet1(generation, consumption):
    cnsmptn = pd.read_excel(consumption)
    gen = pd.read_excel(generation)
    if 'Irradiance onto horizontal plane ' in gen.columns:
        gen.drop('Irradiance onto horizontal plane ', axis=1, inplace=True)

    def str_to_datetime(str):
        return pd.to_datetime(str, format='%d.%m. %H:%M')

    gen['datetime'] = gen['Time'].apply(str_to_datetime)
    gen.drop('Time', axis=1, inplace=True)
    gen.set_index('datetime', drop=True, inplace=True)
    gen['date'] = gen.index.date
    generation = pd.pivot_table(gen, values='Generation', index='date', columns=gen.index.hour)
    generation.fillna(0.0, inplace=True)
    cnsmptn.set_index('Date', inplace=True)
    cnsmptn.sort_index(ascending=True, inplace=True)
    consumption = cnsmptn.copy()
    new_names = {col: i + 1 for i, col in enumerate(consumption.columns)}
    consumption = consumption.rename(columns=new_names)
    data = pd.DataFrame()
    for i in range(1, 25):
        data[str(i)] = consumption[2 * i - 1] + consumption[2 * i]
    consumption = data.copy()
    generation.index = consumption.index
    temps = []
    for i in range(1, 25):
        temp = pd.DataFrame()
        temp['Consumption'] = consumption[str(i)]
        temp['Generation'] = generation[i - 1]
        temp['C-G (+ve)'] = (consumption[str(i)] - generation[i - 1]).clip(lower=0)
        temp['C-G (-ve)'] = (consumption[str(i)] - generation[i - 1]).clip(upper=0)
        temps.append(temp)
    multi_columns = pd.MultiIndex.from_product([range(1, 25), ['Consumption', 'Generation', 'C-G (+ve)', 'C-G (-ve)']])
    df = pd.concat(temps, axis=1, keys=range(1, 25))
    df.columns = multi_columns
    return df
