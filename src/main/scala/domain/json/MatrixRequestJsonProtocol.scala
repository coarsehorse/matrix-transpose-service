package domain.json

import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import domain.MatrixRequest
import spray.json.DefaultJsonProtocol

trait MatrixRequestJsonProtocol extends SprayJsonSupport with DefaultJsonProtocol {
  implicit val requestFormat = jsonFormat1(MatrixRequest)
}
