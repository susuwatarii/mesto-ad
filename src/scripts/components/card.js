const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  currentUserId,
  { onPreviewPicture, onLikeCard, onDeleteCard }
) => {
  const cardElement = getTemplate();

  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const likeCountElement = cardElement.querySelector(".card__like-count");

  const isOwner = data.owner && data.owner._id === currentUserId;
  const isLiked = data.likes.some((user) => user._id === currentUserId);

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;

  if (likeCountElement) {
    likeCountElement.textContent = data.likes.length;
  }

  if (isLiked) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (!isOwner && deleteButton) {
    deleteButton.remove();
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () =>
      onPreviewPicture({ name: data.name, link: data.link })
    );
  }

  if (onLikeCard) {
    likeButton.addEventListener("click", () => {
      onLikeCard(data._id, likeButton.classList.contains("card__like-button_is-active"), likeButton, likeCountElement);
    });
  }

  if (onDeleteCard && deleteButton) {
    deleteButton.addEventListener("click", () => {
      onDeleteCard(data._id, cardElement);
    });
  }

  return cardElement;
};