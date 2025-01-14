import random

def get_random_token_id(token_ids):
    n = len(token_ids)
    # Pick a random index
    random_index = random.randint(0, n - 1)
    # Swap the random index with the last element
    token_ids[random_index], token_ids[n - 1] = token_ids[n - 1], token_ids[random_index]
    # Return the selected token (last element after swapping)
    return token_ids[n - 1]

# Token IDs from 1 to 1000
token_ids = list(range(1, 1001))
random_token = get_random_token_id(token_ids)
print("Random Token ID:", random_token)