package util

object IdGenerator {
  def generate(): String = {
    return String.valueOf(System.nanoTime());
  }
}
