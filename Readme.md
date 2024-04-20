The GET request to the path '/todos/?status=TO%20DO' should return the list of all todos whose status is 'TO DO' as a response
The GET request to the path '/todos/?priority=HIGH' should return the list of all todos whose priority is 'HIGH' as a response
The GET request to the path '/todos/?priority=HIGH&status=IN%20PROGRESS' should return the list of all todos whose priority is 'HIGH' and status is 'IN PROGRESS' as a response
The GET request to the path '/todos/?category=WORK&status=DONE' should return the list of all todos whose category is 'WORK' and status is 'DONE' as a response
The GET request to the path '/todos/?category=LEARNING&priority=HIGH' should return the list of all todos whose category is 'LEARNING' and priority is 'HIGH' as a response
The GET request to the path '/todos/?category=HOME' should return the list of all todos whose category is 'HOME' as a response
The GET request to the path '/todos/?search_q=Buy' should return the list of all todos whose todo contains 'Buy' text as a response
The GET request to the path '/todos/:todoId/' should return a specific todo based on the todo ID as a response
The GET request to the path '/agenda/?date=:date' should return a list of all todos of the specific date as a response upon success
