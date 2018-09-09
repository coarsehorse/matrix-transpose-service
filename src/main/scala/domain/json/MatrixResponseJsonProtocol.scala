package domain.json

import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import domain.MatrixResponse
import spray.json.DefaultJsonProtocol

trait MatrixResponseJsonProtocol extends SprayJsonSupport with DefaultJsonProtocol {
  implicit val responseFormat = jsonFormat3(MatrixResponse)
}
