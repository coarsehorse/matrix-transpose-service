package service
import domain.MatrixResponse
import repository.InMemoryStorage

object MatrixResponseServiceImpl extends MatrixResponseService {

  override def saveResponse(response: MatrixResponse): Unit =
    InMemoryStorage.saveResponse(response)

  override def getResponse(id: String): Option[MatrixResponse] =
    InMemoryStorage.getResponse(id)
}
