import pandas as pd
import numpy as np
import haversine
import geopandas as gpd
import pandas as pd
import argparse
import json


def nearest_neighbor_classification(groupA, groupB, labelsB):
    """
    For each member in group A, finds the nearest member in group B and classifies them based on their nearest neighbor.
    Args:
    groupA (numpy array): 2D array of coordinates for group A
    groupB (numpy array): 2D array of coordinates for group B
    labelsB (numpy array): labels for group B
    Returns:
    numpy array: labels for group A based on nearest neighbor classification
    """
    result = []
    for a in groupA:
        min_distance = np.inf
        nearest_neighbor = None
        for i, b in enumerate(groupB):
            curr_distance = haversine(a, b)
            if curr_distance < min_distance:
                min_distance = curr_distance
                nearest_neighbor = labelsB[i]
        result.append(nearest_neighbor)
    return np.array(result)

def min_max(df, min_max_path= ""):
    df[['race','distances']].groupby(['race']).describe().to_csv(min_max_path+"stats_description.csv")

def find_nearest_neighbors(groupA, groupB):
    return gpd.sjoin_nearest(groupA, groupB, how="left", distance_col="distances")
def mean_distance_by_char_A_geopandas(groupA, groupB, charA, anova_path= ""):
    """
    Calculates the list of mean distance by characteristics C of each member in group A to the nearest neighbor in group B where C is the characteristics of A.
    Args:
    groupA (geopandas GeoDataFrame): GeoDataFrame for group A
    groupB (geopandas GeoDataFrame): GeoDataFrame for group B
    charA (pandas Series): characteristics for group A
    Returns:
    dictionary: mapping of characteristic of A to mean distance for each member in group A
    """
    sjoin = find_nearest_neighbors(groupA, groupB)
    distances = sjoin.distances
    unique_chars = charA.unique()
    # anova_tukey(sjoin, anova_path)
    min_max(sjoin, anova_path)
    result = {char: distances[charA == char].mean() for char in unique_chars}
    return result

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

def get_metrics(people, locations, groupA, groupB):
    dist_dict = mean_distance_by_char_A_geopandas(people, locations, people['race'])
    res = {}
    distparity = dist_dict[groupA]/dist_dict[groupB]
    res['distparity'] = distparity
    return res
    

def parse_args(f):
    with open(f, 'r') as f:
        args = json.load(f)
    return args

if __name__ == "__main__":
    parser = argparse.ArgumentParser("Script")
    parser.add_argument("-c","--config", help="Specify the config file")
    args = parser.parse_args()
    conf = parse_args(args.config)
    
    groupA = conf['groupA']
    groupB = conf['groupB']
    
    people = pd.read_csv(conf['people'])
    people = gpd.GeoDataFrame(
    people[["FIPS","race"]], geometry=gpd.points_from_xy(people.lon, people.lat)
).set_crs('epsg:4326').to_crs('epsg:26916')
    
    locations = gpd.read_file(conf['locations']).to_crs('epsg:26916')
    
    print(get_metrics(people, locations, groupA, groupB))
    
    
    
    
    
    
    