const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const {format} = require('date-fns')

const databasePath = path.join(__dirname, 'todoApplication.db')

const app = express()

app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const isValidStatus = status => {
  const validStatuses = ['TO DO', 'IN PROGRESS', 'DONE']
  return validStatuses.includes(status)
}

const isValidPriority = priority => {
  const validPriorities = ['HIGH', 'MEDIUM', 'LOW']
  return validPriorities.includes(priority)
}

const isValidCategory = category => {
  const validCategories = ['WORK', 'HOME', 'LEARNING']
  return validCategories.includes(category)
}

const isValidDate = date => {
  return !isNaN(new Date(date).getTime())
}

const formatDate = date => {
  return format(new Date(date), 'yyyy-MM-dd')
}

app.get('/todos/', async (request, response) => {
  let getTodosQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 1=1`

  const {search_q, priority, status, category} = request.query

  if (priority) {
    if (!isValidPriority(priority)) {
      return response.status(400).send('Invalid Todo Priority')
    }
    getTodosQuery += ` AND priority = '${priority}'`
  }

  if (status) {
    if (!isValidStatus(status)) {
      return response.status(400).send('Invalid Todo Status')
    }
    getTodosQuery += ` AND status = '${status}'`
  }

  if (category) {
    if (!isValidCategory(category)) {
      return response.status(400).send('Invalid Todo Category')
    }
    getTodosQuery += ` AND category = '${category}'`
  }

  if (search_q) {
    getTodosQuery += ` AND todo LIKE '%${search_q}%'`
  }

  const todos = await database.all(getTodosQuery)
  response.send(todos)
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params

  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`

  const todo = await database.get(getTodoQuery)
  if (todo) {
    response.send(todo)
  } else {
    response.status(404).send('Todo not found')
  }
})

app.get('/agenda/', async (request, response) => {
  const {date} = request.query

  if (!isValidDate(date)) {
    return response.status(400).send('Invalid Due Date')
  }

  const formattedDate = formatDate(date)

  const getAgendaQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      due_date = '${formattedDate}';`

  const agenda = await database.all(getAgendaQuery)
  response.send(agenda)
})

app.post('/todos/', async (request, response) => {
  const {id, todo, category, priority, status, dueDate} = request.body

  if (!isValidPriority(priority)) {
    return response.status(400).send('Invalid Todo Priority')
  }

  if (!isValidStatus(status)) {
    return response.status(400).send('Invalid Todo Status')
  }

  if (!isValidCategory(category)) {
    return response.status(400).send('Invalid Todo Category')
  }

  if (!isValidDate(dueDate)) {
    return response.status(400).send('Invalid Due Date')
  }

  const formattedDate = formatDate(dueDate)

  const postTodoQuery = `
    INSERT INTO
      todo (id, todo, category, priority, status, due_date)
    VALUES
      (${id}, '${todo}', '${category}', '${priority}', '${status}', '${formattedDate}');`

  await database.run(postTodoQuery)
  response.send('Todo Successfully Added')
})

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const requestBody = request.body
  let updateColumn = ''

  if (requestBody.status && !isValidStatus(requestBody.status)) {
    return response.status(400).send('Invalid Todo Status')
  }

  if (requestBody.priority && !isValidPriority(requestBody.priority)) {
    return response.status(400).send('Invalid Todo Priority')
  }

  if (requestBody.category && !isValidCategory(requestBody.category)) {
    return response.status(400).send('Invalid Todo Category')
  }

  if (requestBody.dueDate && !isValidDate(requestBody.dueDate)) {
    return response.status(400).send('Invalid Due Date')
  }

  let updateTodoQuery = `UPDATE todo SET`

  if (requestBody.todo !== undefined) {
    updateColumn = 'Todo'
    updateTodoQuery += ` todo='${requestBody.todo}'`
  }

  if (requestBody.priority !== undefined) {
    updateColumn = 'Priority'
    updateTodoQuery += ` priority='${requestBody.priority}'`
  }

  if (requestBody.status !== undefined) {
    updateColumn = 'Status'
    updateTodoQuery += ` status='${requestBody.status}'`
  }

  if (requestBody.category !== undefined) {
    updateColumn = 'Category'
    updateTodoQuery += ` category='${requestBody.category}'`
  }

  if (requestBody.dueDate !== undefined) {
    updateColumn = 'Due Date'
    const formattedDate = formatDate(requestBody.dueDate)
    updateTodoQuery += ` due_date='${formattedDate}'`
  }

  updateTodoQuery += ` WHERE id = ${todoId};`

  await database.run(updateTodoQuery)
  response.send(`${updateColumn} Updated`)
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodoQuery = `
    DELETE FROM
      todo
    WHERE
      id = ${todoId};`

  await database.run(deleteTodoQuery)

// const express = require('express')
// const {open} = require('sqlite')
// const sqlite3 = require('sqlite3')
// const path = require('path')
// const {format} = require('date-fns')

// const databasePath = path.join(__dirname, 'todoApplication.db')

// const app = express()

// app.use(express.json())

// let database = null

// const initializeDbAndServer = async () => {
//   try {
//     database = await open({
//       filename: databasePath,
//       driver: sqlite3.Database,
//     })

//     app.listen(3000, () =>
//       console.log('Server Running at http://localhost:3000/'),
//     )
//   } catch (error) {
//     console.log(`DB Error: ${error.message}`)
//     process.exit(1)
//   }
// }

// initializeDbAndServer()

// const isValidStatus = status => {
//   const validStatuses = ['TO DO', 'IN PROGRESS', 'DONE']
//   return validStatuses.includes(status)
// }

// const isValidPriority = priority => {
//   const validPriorities = ['HIGH', 'MEDIUM', 'LOW']
//   return validPriorities.includes(priority)
// }

// const isValidCategory = category => {
//   const validCategories = ['WORK', 'HOME', 'LEARNING']
//   return validCategories.includes(category)
// }

// const isValidDate = date => {
//   return !isNaN(new Date(date).getTime())
// }

// const formatDate = date => {
//   return format(new Date(date), 'yyyy-MM-dd')
// }

// app.get('/todos/', async (request, response) => {
//   let getTodosQuery = `
//     SELECT
//       id,
//       todo,
//       priority,
//       status,
//       category,
//       due_date
//     FROM
//       todo
//     WHERE 1=1`

//   const {search_q, priority, status, category} = request.query

//   if (priority) {
//     if (!isValidPriority(priority)) {
//       return response.status(400).send('Invalid Todo Priority')
//     }
//     getTodosQuery += ` AND priority = '${priority}'`
//   }

//   if (status) {
//     if (!isValidStatus(status)) {
//       return response.status(400).send('Invalid Todo Status')
//     }
//     getTodosQuery += ` AND status = '${status}'`
//   }

//   if (category) {
//     if (!isValidCategory(category)) {
//       return response.status(400).send('Invalid Todo Category')
//     }
//     getTodosQuery += ` AND category = '${category}'`
//   }

//   if (search_q) {
//     getTodosQuery += ` AND todo LIKE '%${search_q}%'`
//   }

//   const todos = await database.all(getTodosQuery)
//   response.send(todos)
// })

// app.get('/todos/:todoId/', async (request, response) => {
//   const {todoId} = request.params

//   const getTodoQuery = `
//     SELECT
//       id,
//       todo,
//       priority,
//       status,
//       category,
//       due_date
//     FROM
//       todo
//     WHERE
//       id = ${todoId};`

//   const todo = await database.get(getTodoQuery)
//   if (todo) {
//     response.send(todo)
//   } else {
//     response.status(404).send('Todo not found')
//   }
// })

// app.get('/agenda/', async (request, response) => {
//   const {date} = request.query

//   if (!isValidDate(date)) {
//     return response.status(400).send('Invalid Due Date')
//   }

//   const formattedDate = formatDate(date)

//   const getAgendaQuery = `
//     SELECT
//       *
//     FROM
//       todo
//     WHERE
//       dueDate = '${formattedDate}';`

//   const agenda = await database.all(getAgendaQuery)
//   response.send(agenda)
// })

// app.post('/todos/', async (request, response) => {
//   const {id, todo, category, priority, status, dueDate} = request.body

//   if (!isValidPriority(priority)) {
//     return response.status(400).send('Invalid Todo Priority')
//   }

//   if (!isValidStatus(status)) {
//     return response.status(400).send('Invalid Todo Status')
//   }

//   if (!isValidCategory(category)) {
//     return response.status(400).send('Invalid Todo Category')
//   }

//   if (!isValidDate(dueDate)) {
//     return response.status(400).send('Invalid Due Date')
//   }

//   const formattedDate = formatDate(dueDate)

//   const postTodoQuery = `
//     INSERT INTO
//       todo (id, todo, category, priority, status, due_date)
//     VALUES
//       (${id}, '${todo}', '${category}', '${priority}', '${status}', '${formattedDate}');`

//   await database.run(postTodoQuery)
//   response.send('Todo Successfully Added')
// })

// app.put('/todos/:todoId/', async (request, response) => {
//   const {todoId} = request.params
//   const requestBody = request.body
//   let updateColumn = ''

//   if (requestBody.status && !isValidStatus(requestBody.status)) {
//     return response.status(400).send('Invalid Todo Status')
//   }

//   if (requestBody.priority && !isValidPriority(requestBody.priority)) {
//     return response.status(400).send('Invalid Todo Priority')
//   }

//   if (requestBody.category && !isValidCategory(requestBody.category)) {
//     return response.status(400).send('Invalid Todo Category')
//   }

//   if (requestBody.dueDate && !isValidDate(requestBody.dueDate)) {
//     return response.status(400).send('Invalid Due Date')
//   }

//   let updateTodoQuery = `UPDATE todo SET`

//   if (requestBody.todo !== undefined) {
//     updateColumn = 'Todo'
//     updateTodoQuery += ` todo='${requestBody.todo}'`
//   }

//   if (requestBody.priority !== undefined) {
//     updateColumn = 'Priority'
//     updateTodoQuery += ` priority='${requestBody.priority}'`
//   }

//   if (requestBody.status !== undefined) {
//     updateColumn = 'Status'
//     updateTodoQuery += ` status='${requestBody.status}'`
//   }

//   if (requestBody.category !== undefined) {
//     updateColumn = 'Category'
//     updateTodoQuery += ` category='${requestBody.category}'`
//   }

//   if (requestBody.dueDate !== undefined) {
//     updateColumn = 'Due Date'
//     const formattedDate = formatDate(requestBody.dueDate)
//     updateTodoQuery += ` due_date='${formattedDate}'`
//   }

//   updateTodoQuery += ` WHERE id = ${todoId};`

//   await database.run(updateTodoQuery)
//   response.send(`${updateColumn} Updated`)
// })

// app.delete('/todos/:todoId/', async (request, response) => {
//   const {todoId} = request.params
//   const deleteTodoQuery = `
//     DELETE FROM
//       todo
//     WHERE
//       id = ${todoId};`

//   await database.run(deleteTodoQuery)
//   response.send('Todo Deleted')
// })

// module.exports = app

const express = require('express')
const app = express()
app.use(express.json())
const format = require('date-fns/format')
const isValid = require('date-fns/isValid')
const toDate = require('date-fns/toDate')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')
const dbPath = path.join(__dirname, 'todoApplication.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running at http:/localhost:3000/')
    })
  } catch (e) {
    console.log(e.message)
  }
}

initializeDBAndServer()

const checkRequestsQueries = async (request, response, next) => {
  const {search_q, category, priority, status, date} = request.query
  const {todoId} = request.params
  if (category !== undefined) {
    const categoryArray = ['WORK', 'HOME', 'LEARNING']
    const categoryIsInArray = categoryArray.includes(category)
    if (categoryIsInArray === true) {
      request.category = category
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
      return
    }
  }

  if (priority !== undefined) {
    const priorityArray = ['HIGH', 'MEDIUM', 'LOW']
    const priorityIsInArray = priorityArray.includes(priority)
    if (priorityIsInArray === true) {
      request.priority = priority
    } else {
      response.status(400)
      response.send('Invalid Todo Priority')
      return
    }
  }

  if (status !== undefined) {
    const statusArray = ['TO DO', 'IN PROGRESS', 'DONE']
    const statusIsInArray = statusArray.includes(status)
    if (statusIsInArray === true) {
      request.status = status
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
      return
    }
  }

  if (date !== undefined) {
    try {
      const myDate = new Date(date)

      const formatedDate = format(new Date(date), 'yyyy-MM-dd')
      console.log(formatedDate, 'f')
      const result = toDate(
        new Date(
          `${myDate.getFullYear()}-${
            myDate.getMonth() + 1
          }-${myDate.getDate()}`,
        ),
      )
      console.log(result, 'r')
      console.log(new Date(), 'new')

      const isValidDate = await isValid(result)
      console.log(isValidDate, 'V')
      if (isValidDate === true) {
        request.date = formatedDate
      } else {
        response.status(400)
        response.send('Invalid Due Date')
        return
      }
    } catch (e) {
      response.status(400)
      response.send('Invalid Due Date')
      return
    }
  }

  request.todoId = todoId
  request.search_q = search_q

  next()
}

const checkRequestsBody = (request, response, next) => {
  const {id, todo, category, priority, status, dueDate} = request.body
  const {todoId} = request.params

  if (category !== undefined) {
    categoryArray = ['WORK', 'HOME', 'LEARNING']
    categoryIsInArray = categoryArray.includes(category)

    if (categoryIsInArray === true) {
      request.category = category
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
      return
    }
  }

  if (priority !== undefined) {
    priorityArray = ['HIGH', 'MEDIUM', 'LOW']
    priorityIsInArray = priorityArray.includes(priority)
    if (priorityIsInArray === true) {
      request.priority = priority
    } else {
      response.status(400)
      response.send('Invalid Todo Priority')
      return
    }
  }

  if (status !== undefined) {
    statusArray = ['TO DO', 'IN PROGRESS', 'DONE']
    statusIsInArray = statusArray.includes(status)
    if (statusIsInArray === true) {
      request.status = status
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
      return
    }
  }

  if (dueDate !== undefined) {
    try {
      const myDate = new Date(dueDate)
      const formatedDate = format(new Date(dueDate), 'yyyy-MM-dd')
      console.log(formatedDate)
      const result = toDate(new Date(formatedDate))
      const isValidDate = isValid(result)
      console.log(isValidDate)
      console.log(isValidDate)
      if (isValidDate === true) {
        request.dueDate = formatedDate
      } else {
        response.status(400)
        response.send('Invalid Due Date')
        return
      }
    } catch (e) {
      response.status(400)
      response.send('Invalid Due Date')
      return
    }
  }
  request.todo = todo
  request.id = id

  request.todoId = todoId

  next()
}

//Get Todos API-1
app.get('/todos/', checkRequestsQueries, async (request, response) => {
  const {status = '', search_q = '', priority = '', category = ''} = request
  console.log(status, search_q, priority, category)
  const getTodosQuery = `
        SELECT 
            id,
            todo,
            priority,
            status,
            category,
            due_date AS dueDate 
        FROM 
            todo
        WHERE 
        todo LIKE '%${search_q}%' AND priority LIKE '%${priority}%' 
        AND status LIKE '%${status}%' AND category LIKE '%${category}%';`

  const todosArray = await db.all(getTodosQuery)
  response.send(todosArray)
})

//GET Todo API-2
app.get('/todos/:todoId', checkRequestsQueries, async (request, response) => {
  const {todoId} = request

  const getTodosQuery = `
        SELECT 
            id,
            todo,
            priority,
            status,
            category,
            due_date AS dueDate
        FROM 
            todo            
        WHERE 
            id = ${todoId};`

  const todo = await db.get(getTodosQuery)
  response.send(todo)
})

//GET Agenda API-3
app.get('/agenda/', checkRequestsQueries, async (request, response) => {
  const {date} = request
  console.log(date, 'a')

  const selectDuaDateQuery = `
        SELECT
            id,
            todo,
            priority,
            status,
            category,
            due_date AS dueDate
        FROM 
            todo
        WHERE 
            due_date = '${date}'
        ;`

  const todosArray = await db.all(selectDuaDateQuery)

  if (todosArray === undefined) {
    response.status(400)
    response.send('Invalid Due Date')
  } else {
    response.send(todosArray)
  }
})

//Add Todo API-4
app.post('/todos/', checkRequestsBody, async (request, response) => {
  const {id, todo, category, priority, status, dueDate} = request

  const addTodoQuery = `
        INSERT INTO 
            todo (id, todo, priority, status, category, due_date)
        VALUES
            (
                ${id},
               '${todo}',
               '${priority}',
               '${status}',
               '${category}',
               '${dueDate}'
            )
        ;`

  const createUser = await db.run(addTodoQuery)
  console.log(createUser)
  response.send('Todo Successfully Added')
})

//Update Todo API-5
app.put('/todos/:todoId/', checkRequestsBody, async (request, response) => {
  const {todoId} = request

  const {priority, todo, status, category, dueDate} = request

  let updateTodoQuery = null

  console.log(priority, todo, status, dueDate, category)
  switch (true) {
    case status !== undefined:
      updateTodoQuery = `
            UPDATE
                todo
            SET 
                status = '${status}'
            WHERE 
                id = ${todoId}     
        ;`
      await db.run(updateTodoQuery)
      response.send('Status Updated')
      break
    case priority !== undefined:
      updateTodoQuery = `
            UPDATE
                todo
            SET 
                priority = '${priority}'
            WHERE 
                id = ${todoId}     
        ;`
      await db.run(updateTodoQuery)
      response.send('Priority Updated')
      break
    case todo !== undefined:
      updateTodoQuery = `
            UPDATE
                todo
            SET 
                todo = '${todo}'
            WHERE 
                id = ${todoId}     
        ;`
      await db.run(updateTodoQuery)
      response.send('Todo Updated')
      break
    case category !== undefined:
      const updateCategoryQuery = `
            UPDATE
                todo
            SET 
                category = '${category}'
            WHERE 
                id = ${todoId}     
        ;`
      await db.run(updateCategoryQuery)
      response.send('Category Updated')
      break
    case dueDate !== undefined:
      const updateDateQuery = `
            UPDATE
                todo
            SET 
                due_date = '${dueDate}'
            WHERE 
                id = ${todoId}     
        ;`
      await db.run(updateDateQuery)
      response.send('Due Date Updated')
      break
  }
})

//Delete Todo API-6
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodoQuery = `
            DELETE FROM 
                todo
            WHERE 
               id=${todoId}
     ;`

  await db.run(deleteTodoQuery)

  response.send('Todo Deleted')
})

module.exports = app
