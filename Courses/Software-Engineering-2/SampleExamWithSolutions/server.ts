import { List } from "immutable"
import { Process, _throw, unitProcess, setState, getState } from "./process"
import { Fun } from "./fun"

export interface NetworkError {
  code:       number
  message:    string
}

export interface Product {
  name:       string
  category:   string
  price:      number
}

const makeProduct = (name: string, category: string, price: number): Product => ({
  name: name,
  category: category,
  price: price
})

const printProduct = (product: Product): string =>
  `${product.name}, ${product.category}, ${product.price}`


export interface Server {
  address:          string
  welcomeMessage:   string
  data:             List<Product>    
}

const makeServer = (address: string, welcomeMessage: string, data: List<Product>): Server => ({
  address: address,
  welcomeMessage: welcomeMessage,
  data: data
})

type RequestState = List<Product>

const ikeaProducts =
  List([
    makeProduct("BONDHOLMEN","Table",239.0),
    makeProduct("ADDE","Chair",14.99),
    makeProduct("PELLO", "Armchair", 59.95)
  ])

const alternateProducts =
  List([
    makeProduct("GeForce RTX 4070 MASTER", "Graphic Card", 799.0),
    makeProduct("GIGABYTE M28U", "Monitor", 589.0),
    makeProduct("Intel Core i7-13700K", "CPU", 439.0),
    makeProduct("Logitech G502 HERO", "Mouse", 46.9),
  ])

const schoolProducts =
  List([
    makeProduct("Introduction to Algorithms", "Book", 79.99),
    makeProduct("C++, Advanced Programming Techniques", "Book", 59.99),
    makeProduct("Artificial Intelligence - A Modern Approach", "Book", 109.99),
  ])

const servers = [
  makeServer("192.168.1.1", "Welcome to IKEA!", ikeaProducts),
  makeServer("192.168.1.2", "Welcome to Alternate!", alternateProducts),
  makeServer("192.168.1.3", "Welcome to Amazon!", schoolProducts)
]

const tryGetData = (ip: string): Process<RequestState, NetworkError, List<Product>> => {
  const maybeServer = servers.find(server => server.address == ip)
  if (maybeServer) {
    console.log(maybeServer.welcomeMessage)
    return unitProcess<RequestState, NetworkError, List<Product>>()(maybeServer.data)
  }
  return _throw<RequestState, NetworkError, List<Product>>()({
    code:       503,
    message:    `Cannot connect to server with IP ${ip}`
  })
}

const getAllContent = (ips: List<string>): Process<RequestState, NetworkError, void> => {
  const ip = ips.first()
  if (!ip) {
    return unitProcess<RequestState, NetworkError, void>()()
  }
  return tryGetData(ip)
  .thenBind(Fun((content: List<Product>) => {
    const nextContent = getAllContent(ips.remove(0))
    return nextContent
    .thenBind(Fun(_ => getState<RequestState, NetworkError>()))
    .thenBind(Fun((products: List<Product>) =>
      setState<RequestState, NetworkError>(content.concat(products))
    ))
  }))
}

const showAllContent = (ips: List<string>): Process<RequestState, NetworkError, string> =>
  getAllContent(ips)
  .thenBind(Fun(_ => getState<RequestState, NetworkError>()))
  .thenBind(Fun((products: List<Product>) => 
    unitProcess<RequestState, NetworkError, string>()(products.map(product => printProduct(product)).join("\n"))
  ))

export const runExercise4a = () => showAllContent(List([
  "192.168.1.1",
  "192.168.1.2",
  "192.168.1.3",
]))(List())

export const runExercise4b = () => showAllContent(List([
  "192.168.1.1",
  "192.168.1.4",
  "192.168.1.3",
]))(List())
