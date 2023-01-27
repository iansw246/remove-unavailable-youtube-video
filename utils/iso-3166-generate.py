import csv

# Generates javascript array of ISO-3166 data from
# https://github.com/lukes/ISO-3166-Countries-with-Regional-Codes/blob/master/all/all.csv

# File path for data
CSV_FILE_PATH = "all.csv"
# File path to export javascript file with array
EXPORT_FILE_PATH = "data.js"

with open(CSV_FILE_PATH, mode="r", encoding="utf-8") as data_file:
    csv_data = csv.reader(data_file)
    with open(EXPORT_FILE_PATH, mode="w", encoding="utf-8") as out_file:
        out_file.write("[\n")
        # Skip first line, which is a header
        csv_data_iterator = iter(csv_data)
        next(csv_data_iterator)
        for line in csv_data_iterator:
            out_file.write(f'\t["{line[0]}", "{line[1]}"],\n')
        out_file.write("]\n")
