package repository

import domain.MatrixResponse

import scala.collection.mutable.{HashMap, Map, SynchronizedMap}

object InMemoryStorage {

  var idResponseMap: Map[String, MatrixResponse] = new HashMap[String, MatrixResponse] with
    SynchronizedMap[String, MatrixResponse]

  def saveResponse(matrixResponse: MatrixResponse): Unit = {
    idResponseMap += (matrixResponse.id -> matrixResponse)
  }

  def getResponse(id: String): Option[MatrixResponse] = {
    idResponseMap.get(id)
  }

}
