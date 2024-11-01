import pandas as pd
import geopandas as gpd
import numpy as np
import argparse
import json
from shapely.geometry import Point

pd.options.mode.chained_assignment = None

def merge_dataset(df: pd.DataFrame, list_grouped= ['P1_009N']):
    dict_merge={
        'P1_002N': ['P1_003N', 'P1_004N','P1_005N', 'P1_006N', 'P1_007N', 'P1_008N'],
        'P1_009N': ['P1_011N','P1_012N','P1_013N','P1_014N','P1_015N','P1_016N',
                    'P1_017N','P1_018N','P1_019N','P1_020N','P1_021N','P1_022N',
                    'P1_023N','P1_024N','P1_025N', 'P1_027N', 'P1_028N', 'P1_029N', 'P1_030N',
                'P1_031N', 'P1_032N', 'P1_033N', 'P1_034N', 'P1_035N',
                'P1_036N', 'P1_037N', 'P1_038N', 'P1_039N', 'P1_040N',
                'P1_041N', 'P1_042N', 'P1_043N', 'P1_044N', 'P1_045N',
                'P1_046N', 'P1_048N', 'P1_049N', 'P1_050N', 'P1_051N',
                'P1_052N', 'P1_053N', 'P1_054N', 'P1_055N', 'P1_056N',
                'P1_057N', 'P1_058N', 'P1_059N', 'P1_060N', 'P1_061N',
                'P1_062N', 'P1_063N', 'P1_064N', 'P1_065N', 'P1_066N',
                'P1_067N', 'P1_068N', 'P1_069N', 'P1_071N'],
        'P1_010N': ['P1_011N','P1_012N','P1_013N','P1_014N','P1_015N','P1_016N',
                    'P1_017N','P1_018N','P1_019N','P1_020N','P1_021N','P1_022N',
                    'P1_023N','P1_024N','P1_025N'],
        'P1_026N': ['P1_027N', 'P1_028N', 'P1_029N', 'P1_030N',
                'P1_031N', 'P1_032N', 'P1_033N', 'P1_034N', 'P1_035N',
                'P1_036N', 'P1_037N', 'P1_038N', 'P1_039N', 'P1_040N',
                'P1_041N', 'P1_042N', 'P1_043N', 'P1_044N', 'P1_045N',
                'P1_046N'],
        'P1_047N': [ 'P1_048N', 'P1_049N', 'P1_050N', 'P1_051N',
                'P1_052N', 'P1_053N', 'P1_054N', 'P1_055N', 'P1_056N',
                'P1_057N', 'P1_058N', 'P1_059N', 'P1_060N', 'P1_061N',
                'P1_062N', 'P1_063N', 'P1_064N', 'P1_065N', 'P1_066N',
                'P1_067N', 'P1_068N', 'P1_069N'],
        'P1_008N': ['P1_005N', 'P1_007N', 'P1_008N']
    }
    for label in list_grouped:
      df['race'] = df['race'].replace(dict_merge[label],label)
    return df

def map_race_to_main_category(race):
    if race == 'P1_003N':
        return 'White'
    elif race == 'P1_004N':
        return 'Black'
    elif race == 'P1_006N':
        return 'Asian'
    elif race == 'P1_008N':
        return 'Other Races'
    elif race == 'P1_009N':
        return 'Mixed Races'
    else:
        return 'Other Races'

def calculate_coverage_circle(location, people, radius_miles):
    """
    Calculate the coverage circle for a given location and radius.
    Args:
        location (GeoDataFrame): A single row GeoDataFrame containing the location point.
        people (GeoDataFrame): GeoDataFrame containing population data.
        radius_miles (float): Radius of the coverage circle in miles.
    Returns:
        dict: Coverage statistics including total population and demographic percentages.
    """
    # Convert miles to meters (1 mile = 1609.34 meters)
    radius_meters = float(radius_miles) * 1609.34
    
    # Create a buffer around the location point
    coverage_area = location.geometry.buffer(radius_meters)

    # Find all people within the coverage area
    people_in_coverage = people[people.geometry.within(coverage_area.iloc[0])]

    # Calculate total population in coverage area
    total_population = len(people_in_coverage)

    # Map races to main categories
    people_in_coverage['main_race'] = people_in_coverage['race'].apply(map_race_to_main_category)

    # Calculate demographic percentages for main categories
    race_counts = people_in_coverage['main_race'].value_counts()
    race_percentages = (race_counts / total_population * 100).round(2)

    # Prepare results
    results = {
        # "total_population": total_population,
        "demographic_percentages": race_percentages.to_dict()
        # race_percentages.to_dict()
    }

    return results
    # Only return race_percentages
    


def coverage_stats_cal(people_path, longitude, latitude, radius_miles):
    # Load people data
    people = pd.read_csv(people_path)
    
    # Apply merge_dataset function
    people = merge_dataset(people, list_grouped=['P1_009N', 'P1_008N'])
    
    people_gdf = gpd.GeoDataFrame(
        people[["FIPS", "race"]],
        geometry=gpd.points_from_xy(people.lon, people.lat)
    ).set_crs('epsg:4326').to_crs('epsg:26916')

    # Create a GeoDataFrame for the target location
    target_location = gpd.GeoDataFrame(
        {'geometry': [Point(float(longitude), float(latitude))]},
        crs='epsg:4326'
    ).to_crs('epsg:26916')

    # Calculate coverage
    coverage_stats = calculate_coverage_circle(target_location, people_gdf, radius_miles)
    
    # Save to JSON file
    with open('./fairness/coverage_stats.json', 'w') as json_file:
        json.dump(coverage_stats, json_file, indent=4)

    return coverage_stats

def parse_args(f):
    with open(f, 'r') as f:
        args = json.load(f)
    return args

if __name__ == "__main__":
    parser = argparse.ArgumentParser("Script")
    parser.add_argument("-c","--config", help="Specify the config file")
    args = parser.parse_args()
    conf = parse_args(args.config)
    
    people = conf['people']
#     people = merge_dataset(people, list_grouped=['P1_009N', 'P1_008N'])
    
#     people = gpd.GeoDataFrame(
#     people[["FIPS","race"]], geometry=gpd.points_from_xy(people.lon, people.lat)
# ).set_crs('epsg:4326').to_crs('epsg:26916')
    
    longitude = float(conf['longitude'])
    latitude = float(conf['latitude'])
    radius_miles = float(conf['radius_miles'])
    
    results = coverage_stats_cal(people, longitude, latitude, radius_miles)
    # convert to json
    print(json.dumps(results))
    
    # print(f"Coverage Circle Statistics (Radius: {radius_miles} miles)")
    # print(f"Total Population: {results['total_population']}")
    # print("Demographic Percentages:")
    # for race, percentage in results['demographic_percentages'].items():
    #     print(json.dumps(f" {race}: {percentage}%"))
    
    # print("Results have been saved to 'coverage_stats.json'")