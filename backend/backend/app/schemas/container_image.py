from pydantic import BaseModel, Field, field_validator


class ContainerImageResponse(BaseModel):
    image_url: str = Field(pattern=r"^/uploads/[^/\\]+$")

    @field_validator("image_url")
    @classmethod
    def validate_image_url(cls, value: str) -> str:
        if ".." in value:
            raise ValueError("image_url must not contain path traversal.")
        return value
