import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.{ContentTypes, HttpEntity, StatusCodes}
import akka.http.scaladsl.server.Route
import akka.stream.ActorMaterializer
import akka.http.scaladsl.server.Directives._
import domain.{MatrixRequest, MatrixResponse}
import domain.json.{MatrixRequestJsonProtocol, MatrixResponseJsonProtocol}
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import service.MatrixResponseServiceImpl
import util.IdGenerator

import scala.concurrent.Future
import scala.io.StdIn

object MatrixServer extends MatrixRequestJsonProtocol with MatrixResponseJsonProtocol{
  implicit val system = ActorSystem()
  implicit val materializer = ActorMaterializer()
  implicit val executionContext = system.dispatcher

  def main(args: Array[String]) {
    val route: Route =
      pathPrefix("") {
        get {
          (pathEndOrSingleSlash & redirectToTrailingSlashIfMissing(StatusCodes.TemporaryRedirect)) {
            getFromResource("index/index.html")
          } ~ {
            getFromResourceDirectory("index")
          }
        }
      } ~
        path("transpose") {
          post {
            entity(as[MatrixRequest]) { request =>
              val id: String = IdGenerator.generate()
              val transposedMatrix = request.sourceMatrix.transpose

              MatrixResponseServiceImpl.saveResponse(
                MatrixResponse(id, request.sourceMatrix, transposedMatrix))
              complete(id)
            }
          }
        } ~
    path("res" / Remaining) { id =>
      get {
        MatrixResponseServiceImpl.getResponse(id) match {
          case response: Some[MatrixResponse] =>
            complete(response)
          case None =>
            complete("Not found response with id: " + id)
        }
      }
    } ~
    path("test") {
      get {
        val testMatrix = List(List(1, 2, 3, 4, 5, 6),
          List(-1, -2, -3, -4, -5, -6),
          List(11, 12, 13, 14, 15, 16))
        complete(MatrixResponse("1", testMatrix, testMatrix.transpose))
      }
    }

    val bindingFuture = Http().bindAndHandle(route, "localhost", 8080)
    println(s"Server online at http://localhost:8080/\nPress RETURN to stop...")
    StdIn.readLine() // let it run until user presses return
    bindingFuture
      .flatMap(_.unbind()) // trigger unbinding from the port
      .onComplete(_ ⇒ system.terminate()) // and shutdown when done

  }
}
