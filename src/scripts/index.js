import {
  enableValidation,
  clearValidation,
} from "./components/validation.js";
import {
  createCardElement,
  updateLike,
  deleteCardElement,
} from "./components/card.js";
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addNewCard,
  deleteCardRequest,
  changeLikeCardStatus,
} from "./components/api.js";

// DOM узлы
const placesWrap = document.querySelector(".places__list");

const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const logoElement = document.querySelector(".header__logo");

const usersStatsModalWindow = document.querySelector(".popup_type_info");
const usersStatsModalTitle = usersStatsModalWindow.querySelector(".popup__title");
const usersStatsModalInfoList = usersStatsModalWindow.querySelector(".popup__info");
const usersStatsModalUsersList = usersStatsModalWindow.querySelector(".popup__list");
const usersStatsModalText = usersStatsModalWindow.querySelector(".popup__text");

const infoStringTemplate = document.querySelector("#popup-info-definition-template").content;
const userPreviewTemplate = document.querySelector("#popup-info-user-preview-template").content;


const confirmDeleteModalWindow = document.querySelector(".popup_type_confirm");
const confirmDeleteForm = confirmDeleteModalWindow.querySelector(".popup__form");

let cardToDelete = null;
let cardIdToDelete = null;

let currentUserId = "";

const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (label, value) => {
  const infoItem = infoStringTemplate
    .querySelector(".popup__info-item")
    .cloneNode(true);

  infoItem.querySelector(".popup__info-term").textContent = label;
  infoItem.querySelector(".popup__info-description").textContent = value;

  return infoItem;
};

const createUserPreview = (userName) => {
  const userItem = userPreviewTemplate
    .querySelector(".popup__list-item")
    .cloneNode(true);

  userItem.textContent = userName;

  return userItem;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleDeleteCard = (cardId, cardElement) => {
  cardToDelete = cardElement;
  cardIdToDelete = cardId;

  openModalWindow(confirmDeleteModalWindow);
};

const handleLikeCard = (cardId, isLiked, likeButton, likeCountElement) => {
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      updateLike(likeButton, likeCountElement, updatedCard.likes.length);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = evt.submitter;
  const defaultText = submitButton.textContent;
  submitButton.textContent = "Сохранение...";

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = defaultText;
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = evt.submitter;
  const defaultText = submitButton.textContent;
  submitButton.textContent = "Сохранение...";

  setUserAvatar({
    avatar: avatarInput.value,
  })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
      avatarForm.reset();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = defaultText;
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = evt.submitter;
  const defaultText = submitButton.textContent;
  submitButton.textContent = "Создание...";

  addNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      placesWrap.prepend(
        createCardElement(cardData, currentUserId, {
          onPreviewPicture: handlePreviewPicture,
          onDeleteCard: handleDeleteCard,
          onLikeCard: handleLikeCard,
        })
      );

      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = defaultText;
    });
};

const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      usersStatsModalTitle.textContent = "Статистика пользователей";
      usersStatsModalText.textContent = "Все пользователи:";
      usersStatsModalInfoList.innerHTML = "";
      usersStatsModalUsersList.innerHTML = "";

      const uniqueUsers = [...new Set(cards.map((card) => card.owner.name))];

      const userCardsMap = {};
      cards.forEach((card) => {
        const userName = card.owner.name;
        userCardsMap[userName] = (userCardsMap[userName] || 0) + 1;
      });

      const maxCardsFromOneUser = Math.max(...Object.values(userCardsMap));

      usersStatsModalInfoList.append(
        createInfoString("Всего карточек:", cards.length)
      );

      usersStatsModalInfoList.append(
        createInfoString("Первая создана:", formatDate(new Date(cards[cards.length - 1].createdAt)))
      );

      usersStatsModalInfoList.append(
        createInfoString("Последняя создана:", formatDate(new Date(cards[0].createdAt)))
      );

      usersStatsModalInfoList.append(
        createInfoString("Всего пользователей:", uniqueUsers.length)
      );

      usersStatsModalInfoList.append(
        createInfoString("Максимум карточек от одного:", maxCardsFromOneUser)
      );

      uniqueUsers.forEach((userName) => {
        usersStatsModalUsersList.append(createUserPreview(userName));
      });

      openModalWindow(usersStatsModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);
logoElement.addEventListener("click", handleLogoClick);

confirmDeleteForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const submitButton = evt.submitter;
  const defaultText = submitButton.textContent;
  submitButton.textContent = "Удаление...";

  deleteCardRequest(cardIdToDelete)
    .then(() => {
      deleteCardElement(cardToDelete);
      closeModalWindow(confirmDeleteModalWindow);

      cardToDelete = null;
      cardIdToDelete = null;
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = defaultText;
    });
});

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationConfig);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationConfig);
  openModalWindow(cardFormModalWindow);
});

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((card) => {
      placesWrap.append(
        createCardElement(card, currentUserId, {
          onPreviewPicture: handlePreviewPicture,
          onDeleteCard: handleDeleteCard,
          onLikeCard: handleLikeCard,
        })
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });

// настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationConfig);