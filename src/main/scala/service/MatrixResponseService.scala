package service

import domain.MatrixResponse

trait MatrixResponseService {
  def saveResponse(response: MatrixResponse): Unit
  def getResponse(id: String): Option[MatrixResponse]
}
