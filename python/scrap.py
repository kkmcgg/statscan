import pandas as pd
file_path = r"R:\AGRG\Support\Maps\StatsCan\98-401-X2021006CI_Atlantic_Atlantique_eng_CSV\98-401-X2021006CI_English_CSV_data_Atlantic.csv"
encoding ='latin1'
df = pd.read_csv(file_path, encoding=encoding)

print(df.head())
print(df.columns)




#####################################


import pandas as pd

file_path = r"R:\AGRG\Support\Maps\StatsCan\98-401-X2021006CI_Atlantic_Atlantique_eng_CSV\98-401-X2021006CI_English_CSV_data_Atlantic.csv"

# Read the CSV file with the appropriate encoding (e.g., 'latin1')
df = pd.read_csv(file_path, encoding='latin1')

# Filter rows for age groups 55 and older
age_55_plus = df[df['CHARACTERISTIC_NAME'].str.contains('55 to') | df['CHARACTERISTIC_NAME'].str.contains('60 to') | df['CHARACTERISTIC_NAME'].str.contains('65 and over')]

# Summarize the counts
age_55_plus_summary = age_55_plus.groupby('DGUID').agg({
    'C1_COUNT_TOTAL': 'sum',
    'C2_COUNT_MEN+': 'sum',
    'C3_COUNT_WOMEN+': 'sum'
}).reset_index()

# Display the summary
print(age_55_plus_summary.head())


##################################################


import pandas as pd

file_path = r"R:\AGRG\Support\Maps\StatsCan\98-401-X2021006CI_Atlantic_Atlantique_eng_CSV\98-401-X2021006CI_English_CSV_data_Atlantic.csv"

# Read the CSV file with the appropriate encoding (e.g., 'latin1')
df = pd.read_csv(file_path, encoding='latin1')

# Inspect unique values in CHARACTERISTIC_NAME
unique_characteristics = df['CHARACTERISTIC_NAME'].unique()
#print(unique_characteristics)

for e in unique_characteristics:
	print(e)

# Filter rows for age groups 55 and older based on unique values
age_55_plus = df[df['CHARACTERISTIC_NAME'].str.contains('55 to|60 to|65 to|70 to|75 to|80 to|85 to|90 to|95 to|100 and over', regex=True)]

# Inspect the filtered data
print(age_55_plus[['CHARACTERISTIC_NAME', 'C1_COUNT_TOTAL', 'C2_COUNT_MEN+', 'C3_COUNT_WOMEN+']].head(20))

# Summarize the counts
age_55_plus_summary = age_55_plus.groupby('DGUID').agg({
    'C1_COUNT_TOTAL': 'sum',
    'C2_COUNT_MEN+': 'sum',
    'C3_COUNT_WOMEN+': 'sum'
}).reset_index()

# Display the summary
print(age_55_plus_summary.head())
