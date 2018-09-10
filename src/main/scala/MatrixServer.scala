import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Route
import akka.stream.ActorMaterializer
import akka.http.scaladsl.server.Directives._
import domain.{MatrixRequest, MatrixResponse}
import domain.json.{MatrixRequestJsonProtocol, MatrixResponseJsonProtocol}

import scala.io.StdIn

object MatrixServer extends MatrixRequestJsonProtocol with MatrixResponseJsonProtocol {
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
              val sourceMatrix = request.sourceMatrix
              val transposedMatrix = sourceMatrix.transpose
              complete(MatrixResponse(sourceMatrix, transposedMatrix))
            }
          }
        } ~
        path("test") {
          get {
            val testMatrix = List(List(1, 2, 3, 4, 5, 6),
              List(-1, -2, -3, -4, -5, -6),
              List(11, 12, 13, 14, 15, 16))
            complete(MatrixResponse(testMatrix, testMatrix.transpose))
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
